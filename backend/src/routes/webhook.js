const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

router.post('/', express.json({ type: '*/*' }), async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { userId, planType } = event.data.metadata;
    const subscriptionId = event.data.subscription?.subscription_code || null;

    await User.updatePlan(userId, planType, subscriptionId);
  }

  res.sendStatus(200);
});

module.exports = router;
