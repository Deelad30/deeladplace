// routes/flutterwave.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const database = require('../config/database');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');
const router = express.Router();

const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
// Base URL for verification redirect (if needed) or frontend callback
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Map internal plan types to Flutterwave Plan IDs (Optional: for recurring)
// You needs to create these plans in Flutterwave Dashboard and add to .env
const planMap = {
  test: process.env.FLUTTERWAVE_TEST_PLAN_ID,
  pro: process.env.FLUTTERWAVE_PRO_PLAN_ID,
  enterprise: process.env.FLUTTERWAVE_ENTERPRISE_PLAN_ID
};

const planPrices = {
  basic: 10000, 
  pro: 20000,
  enterprise: 0 // Custom
};

/**
 * Verify payment by transaction_id (from frontend)
 */
router.post('/verify', async (req, res) => {
    const { transaction_id, planType, userId } = req.body;

    if (!transaction_id || !userId || !planType) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    if (!FLUTTERWAVE_SECRET) {
        logger.error('Flutterwave Secret Key is missing in environment variables');
        return res.status(500).json({ error: 'Server misconfiguration: Missing Secret Key' });
    }

    logger.info('Verifying payment...', { transaction_id, planType, userId });

    try {
        // 1. Verify with Flutterwave
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: { Authorization: `Bearer ${FLUTTERWAVE_SECRET}` }
            }
        );

        const data = response.data.data;

        if (response.data.status === 'success' && data.status === 'successful') {
            // 2. Validate Amount and Currency
            const expectedAmount = planPrices[planType] || 0;
            
            // Debug logs
            logger.info('Verifying Flutterwave Transaction', { 
                flutterwaveAmount: data.amount, 
                expectedAmount, 
                currency: data.currency,
                planType 
            });

            if (data.amount < expectedAmount) {
                 return res.status(400).json({ 
                     error: `Amount mismatch: Paid ${data.amount}, expected ${expectedAmount}` 
                 });
            }
            if (data.currency !== 'NGN') {
                return res.status(400).json({ 
                    error: `Currency mismatch: Paid in ${data.currency}, expected NGN` 
                });
            }

            // 3. Update User in DB
            const subscriptionCode = data.plan || `sub_${transaction_id}`; 
            
            await database.query(
                'UPDATE users SET plan_type = $1, subscription_code = $2 WHERE id = $3',
                [planType, subscriptionCode, userId]
            );

            // 4. Send Email
            const user = await User.findById(userId);
            if (user) {
                await emailService.sendSubscriptionSuccessEmail(user, planType);
            }

            return res.json({ success: true, message: 'Payment verified and plan updated', data });

        } else {
            logger.warn('Flutterwave verification status failed', { status: response.data?.status, dataStatus: data?.status });
            return res.status(400).json({ error: 'Transaction status was not successful' });
        }

    } catch (error) {
        logger.error('Flutterwave Verification Error', { 
            message: error.message, 
            response: error.response?.data 
        });
        
        // Send specific error to frontend
        const message = error.response?.data?.message || error.message;
        res.status(500).json({ error: `Verification failed: ${message}` });
    }
});

/**
 * Webhook (Optional for recurring updates)
 */
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== secretHash) {
        return res.status(401).end();
    }

    const payload = req.body;
    // Handle events like 'charge.completed'
    logger.info('Flutterwave Webhook received', { event: payload['event.type'] || payload.event });
    
    // Support both event formats (v3 vs legacy)
    const eventType = payload['event.type'] || payload.event;
    const data = payload.data;

    if (eventType === 'charge.completed' && data.status === 'successful') {
        const email = data.customer.email;
        const paidAmount = data.amount;
        const currency = data.currency;

        // Basic validation logic
        if (currency !== 'NGN') {
             logger.warn('Webhook ignored: Invalid currency', { currency });
             return res.sendStatus(200);
        }

        try {
            // Find user by email
            const userRes = await database.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = userRes.rows[0];

            if (user) {
                // Determine Plan based on Amount (Fallback if plan_id isn't clear)
                let newPlanType = user.plan_type; 
                // You could map amounts back to plans: 
                // 10000 -> basic, 20000 -> pro.
                if (paidAmount >= 20000) newPlanType = 'pro';
                else if (paidAmount >= 10000) newPlanType = 'basic';
                
                await database.query(
                    'UPDATE users SET plan_type = $1, subscription_code = $2, status = $3 WHERE id = $4',
                    [newPlanType, data.plan || data.tx_ref, 'active', user.id]
                );
                
                logger.info('User plan updated via Webhook', { userId: user.id, plan: newPlanType });
                
                // Optional: Send Renewal Success Email
            } else {
                logger.warn('Webhook: User not found for email', { email });
            }
        } catch (dbError) {
            logger.error('Webhook DB Error', { error: dbError.message });
        }
    }

    res.sendStatus(200);
});

module.exports = router;
