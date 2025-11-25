// routes/salesRoutes.js
const express = require('express');
const router = express.Router();

const {
  createSale,
  getSalesSummary,
  getOverview,
  getTopProducts,
  getPaymentSummary,
  getSalesPaginated,
  getVendorsSummary
} = require('../controllers/salesController');

// Create a sale
router.post('/', createSale);

// Paginated sales / list with filters
router.get('/', getSalesPaginated);

// Daily summary for charts (30 days)
router.get('/summary', getSalesSummary);

// Overview KPI
router.get('/overview', getOverview);

// Top products
router.get('/top-products', getTopProducts);

// Payment breakdown
router.get('/payment-summary', getPaymentSummary);

// Vendor summary
router.get('/vendors', getVendorsSummary);

module.exports = router;
