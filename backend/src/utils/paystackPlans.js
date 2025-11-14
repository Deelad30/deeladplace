// utils/paystackPlans.js
const axios = require("axios");
require("dotenv").config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Cache plans for 10 minutes
let cachedPlans = null;
let lastFetchTime = 0;

async function fetchPaystackPlans() {
  const now = Date.now();

  // return cache if valid
  if (cachedPlans && now - lastFetchTime < 10 * 60 * 1000) {
    return cachedPlans;
  }

  try {
    const resp = await axios.get(
      "https://api.paystack.co/plan",
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    const plans = resp.data.data;

    console.log(plans);
    
    // Transform plan list into easy lookup object
    const planMap = {};
    plans.forEach(plan => {
      planMap[plan.plan_code] = {
        name: plan.name,
        interval: plan.interval,
        amount: plan.amount, // amount in kobo
        currency: plan.currency,
        plan_code: plan.plan_code
      };
    });

    cachedPlans = planMap;
    lastFetchTime = now;

    return planMap;

  } catch (err) {
    console.error("Failed to fetch Paystack plans", err.response?.data || err.message);
    return {};
  }
}

module.exports = { fetchPaystackPlans };
