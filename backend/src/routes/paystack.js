// routes/paystack.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const database = require('../config/database');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Map your internal plan types to Paystack plan codes
const planMap = {
  test: process.env.PAYSTACK_TEST_PLAN,
  pro: process.env.PAYSTACK_PRO_PLAN,
  enterprise: process.env.PAYSTACK_ENTERPRISE_PLAN
};

// Helper: safely parse metadata from webhook
function parseMetadata(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

/**
 * Create / initialize subscription
 */
router.post('/create-subscription', async (req, res) => {
  const { userId, planType, customerEmail } = req.body;
  if (!userId || !planType || !customerEmail) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const planCode = planMap[planType];
  if (!planCode) return res.status(400).json({ error: 'Invalid plan type' });

  try {
    const { fetchPaystackPlans } = require("../utils/paystackPlans");
    const paystackPlans = await fetchPaystackPlans();
    const planDetails = paystackPlans[planCode];

    if (!planDetails) return res.status(500).json({ error: 'Plan not found on Paystack' });

    const planAmountInKobo = planDetails.amount;
          console.log("Using PAYSTACK plan price:", planAmountInKobo, "for plan:", planType);

    // Create or fetch Paystack customer
    const customerResp = await axios.post(
      'https://api.paystack.co/customer',
      { email: customerEmail },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const customer = customerResp.data?.data;
    const customerCode = customer.customer_code;

    // If customer has saved authorizations, create subscription directly
    if (customer.authorizations && customer.authorizations.length > 0) {
      const subscriptionResp = await axios.post(
        'https://api.paystack.co/subscription',
        { customer: customerCode, plan: planCode, metadata: { userId: String(userId), planType } },
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
      );

      const subscription = subscriptionResp.data.data;

      // Update user in DB
      await database.query(
        'UPDATE users SET plan_type = $1, subscription_code = $2 WHERE id = $3',
        [planType, subscription.subscription_code, userId]
      );

      await emailService.sendSubscriptionSuccessEmail({ id: userId, email: customerEmail }, planType);
      return res.json({ success: true, subscription });
    }

    // Otherwise initialize transaction for first payment
    const initResp = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: customerEmail,
        amount: planAmountInKobo,
        plan: planCode,
        metadata: { userId: String(userId), planType },
        callback_url: `${CLIENT_URL}/paystack/callback`
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const initData = initResp.data.data;
    return res.json({
      success: false,
      message: 'Customer has no saved authorizations. Redirect user to Paystack.',
      authorization_url: initData.authorization_url,
      reference: initData.reference,
      amount_charged: planAmountInKobo
    });

  } catch (err) {
    console.error("Create subscription error:", err.response?.data || err.message);
    return res.status(500).json({ error: 'Subscription creation failed' });
  }
});

/**
 * Verify payment by reference
 */
router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const verifyResp = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const data = verifyResp.data?.data;
    if (!verifyResp.data || !verifyResp.data.status) return res.json({ status: 'error', data: verifyResp.data });

    if (data.status === 'success') return res.json({ status: 'success', data });
    return res.json({ status: 'failed', data });
  } catch (err) {
    console.error('Verify error:', err.response?.data || err.message);
    return res.status(500).json({ status: 'error' });
  }
});

/**
 * Paystack webhook
 */
// Paystack Webhook Endpoint
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const body = JSON.stringify(req.body || {});
    const expectedHash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');

    if (signature !== expectedHash) {
      console.warn('Invalid Paystack webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    console.log('Webhook event:', event.event);

    const metadata = parseMetadata(event.data?.metadata);
    const userId = metadata?.userId;
    const planType = metadata?.planType;

    if (!userId) {
      console.log('Webhook: no user metadata; event:', event.event);
      return res.sendStatus(200);
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn('Webhook: user not found for id', userId);
      return res.sendStatus(200);
    }

    let subscriptionCode;

    switch (event.event) {
      case 'charge.success':
      case 'subscription.create':
      case 'invoice.create': {
        // Extract subscription code from Paystack event
        subscriptionCode = event.data?.subscription?.subscription_code || event.data?.authorization?.authorization_code;

        if (!subscriptionCode) {
          console.warn('Webhook: no subscription code found in event');
          break;
        }

        // Check if user already has a subscription
        if (user.subscription_code && user.subscription_code !== subscriptionCode) {
          // Optional: disable old subscription in Paystack
          try {
            await axios.post(
              `https://api.paystack.co/subscription/disable`,
              { code: user.subscription_code },
              { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
            );
            console.log(`Disabled old subscription ${user.subscription_code} for user ${userId}`);
          } catch (err) {
            console.error('Failed to disable old subscription:', err.response?.data || err.message);
          }
        }

        // Update DB with new plan and subscription
        await User.updatePlan(String(userId), planType, subscriptionCode);
        console.log(`DB updated with subscription ${subscriptionCode} for user ${userId}`);

        // Send email notification
        await emailService.sendSubscriptionSuccessEmail(user, planType);
        console.log(`Subscription success email sent to user ${userId}`);
        break;
      }

      case 'charge.failed':
        await emailService.sendSubscriptionPaymentFailed(user, planType);
        console.log(`Subscription payment failed email sent to user ${userId}`);
        break;

      case 'subscription.disable':
        console.log(`Subscription disabled for user ${userId}`);
        break;

      case 'subscription.renewal':
        console.log(`Subscription renewed for user ${userId}`);
        break;

      default:
        console.log('Webhook: unhandled event type', event.event);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  // Always respond 200 to avoid retries
  res.sendStatus(200);
});


/**
 * Fetch all Paystack plans
 */
router.get("/plans", async (req, res) => {
  try {
    const { fetchPaystackPlans } = require("../utils/paystackPlans");
    const plans = await fetchPaystackPlans();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, error: "Could not fetch Paystack plans" });
  }
});

module.exports = router;
