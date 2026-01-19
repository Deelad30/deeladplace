// routes/paystack.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const database = require('../config/database');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');
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
    logger.info("Using PAYSTACK plan price", { planAmountInKobo, planType, planCode });

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
    logger.error("Create subscription error", { error: err.response?.data || err.message, userId, planType });
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
    logger.error('Verify error', { error: err.response?.data || err.message, reference });
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
      logger.warn('Invalid Paystack webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    logger.info('Received Paystack webhook event', { event: event.event });

    const metadata = parseMetadata(event.data?.metadata);
    const userId = metadata?.userId;
    const planType = metadata?.planType;

    if (!userId) {
      logger.info('Webhook: no user metadata found', { event: event.event });
      return res.sendStatus(200);
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn('Webhook: user not found', { userId });
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
          logger.warn('Webhook: no subscription code found in event', { event: event.event });
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
            logger.info('Disabled old subscription in Paystack', { oldSubscriptionCode: user.subscription_code, userId });
          } catch (err) {
            logger.error('Failed to disable old subscription', { error: err.response?.data || err.message, userId });
          }
        }

        await User.updatePlan(String(userId), planType, subscriptionCode);
        logger.info('User plan updated via webhook', { userId, planType, subscriptionCode });

        // Send email notification
        await emailService.sendSubscriptionSuccessEmail(user, planType);
        logger.info('Subscription success email sent', { userId });
        break;
      }

      case 'charge.failed':
        await emailService.sendSubscriptionPaymentFailed(user, planType);
        logger.info('Subscription payment failed email sent', { userId });
        break;

      case 'subscription.disable':
        logger.info('Subscription disabled for user', { userId });
        break;

      case 'subscription.renewal':
        logger.info('Subscription renewed for user', { userId });
        break;

      default:
        logger.info('Webhook: unhandled event type', { event: event.event });
    }
  } catch (err) {
    logger.error('Webhook processing error', { error: err.message, stack: err.stack });
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
