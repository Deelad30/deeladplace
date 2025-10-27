const express = require('express');
const { createSale, getSalesSummary } = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');
const { validateSalesData } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateSalesData, createSale);
router.get('/summary', getSalesSummary);

module.exports = router;