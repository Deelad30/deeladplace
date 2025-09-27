const express = require('express');
const {
  getAllSales,
  createSale,
  getSalesSummary
} = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllSales);
router.post('/', createSale);
router.get('/summary', getSalesSummary);

module.exports = router;