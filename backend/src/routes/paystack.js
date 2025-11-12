const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/initialize', async (req, res) => {
  const { email, amount, planType, userId } = req.body;

  try {
    const planCode =
      planType === 'pro'
        ? process.env.PAYSTACK_PRO_PLAN
        : process.env.PAYSTACK_ENTERPRISE_PLAN;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100,
        plan: planCode, 
        callback_url: `${process.env.CLIENT_URL}/payment/success`,
        metadata: { userId, planType },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error initializing payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    // You can save response.data.data to your DB here for records
    res.json(response.data.data);
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});


module.exports = router;
