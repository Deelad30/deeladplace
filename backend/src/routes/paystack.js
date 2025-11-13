const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../utils/emailService');
require('dotenv').config();

const router = express.Router();

// Plan mapping
const planMap = {
  test: process.env.PAYSTACK_TEST_PLAN,          // hourly test plan
  pro: process.env.PAYSTACK_PRO_PLAN,           // monthly pro plan
  enterprise: process.env.PAYSTACK_ENTERPRISE_PLAN // monthly enterprise plan
};

// Create subscription
router.post('/create-subscription', async (req, res) => {
  const { userId, planType, customerEmail } = req.body;

  if (!userId || !planType || !customerEmail) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const planCode = planMap[planType];
  if (!planCode) return res.status(400).json({ error: 'Invalid plan type' });

  try {
    const response = await axios.post(
      'https://api.paystack.co/subscription',
      {
        customer: customerEmail,
        plan: planCode,
        start_date: new Date().toISOString(),
        metadata: { userId, planType }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const subscriptionCode = response.data.data.subscription_code;

    // Update user with subscription info
    await User.updatePlan(userId, planType, subscriptionCode);

    res.json({ success: true, subscription: response.data.data });
  } catch (err) {
    console.error('Subscription creation failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Subscription creation failed' });
  }
});

router.post('/', express.json({ type: '*/*' }), async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // // Verify signature
  // const hash = crypto.createHmac('sha512', secret)
  //                    .update(JSON.stringify(req.body))
  //                    .digest('hex');

  // if (hash !== req.headers['x-paystack-signature']) {
  //   console.warn('❌ Invalid webhook signature');
  //   return res.status(400).send('Invalid signature');
  // }

  const event = req.body;
  console.log('📥 Paystack webhook event:', JSON.stringify(event, null, 2));

  const subscriptionCode = event.data.subscription?.subscription_code || null;
let userId, planType;
if (['charge.success', 'charge.failed', 'subscription.create'].includes(event.event)) {
  userId = event.data.metadata?.userId;
  planType = event.data.metadata?.planType;
  if (!userId || !planType) {
    console.warn('⚠️ Webhook missing userId or planType');
    return res.sendStatus(400);
  }
}


 try {
  const existingUser = await User.findById(userId);
  if (!existingUser) return res.sendStatus(404);

  switch (event.event) {
    case 'charge.success':
      await User.updatePlan(userId, planType, subscriptionCode);
      console.log(`✅ User ${userId} charged successfully for ${planType} plan`);
      await emailService.sendSubscriptionSuccessEmail(existingUser, planType);
      break;

    case 'charge.failed':
      console.log(`❌ User ${userId} payment failed for ${planType} plan`);
      await emailService.sendSubscriptionPaymentFailed(existingUser, planType);
      break;

    case 'subscription.create':
      // Only check for duplicates here
      if (existingUser.subscription_code !== subscriptionCode) {
        await User.updatePlan(userId, planType, subscriptionCode);
        console.log(`🟢 Subscription created for user ${userId}`);
      } else {
        console.log(`⚠️ Duplicate subscription creation ignored for user ${userId}`);
      }
      break;

    case 'subscription.disable':
      console.log(`⚠️ Subscription disabled for user ${userId}`);
      break;

    case 'subscription.renewal':
      console.log(`🔄 Subscription renewed for user ${userId}`);
      break;

    default:
      console.log('Unhandled event type:', event.event);
  }
} catch (err) {
  console.error('Webhook handling error:', err);
}

  // Always respond with 200 to prevent Paystack retries
  res.sendStatus(200);
});



module.exports = router;
