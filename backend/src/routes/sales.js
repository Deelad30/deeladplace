const express = require('express');
const {
  getSales,
  createSale,
  getSalesSummary
} = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSales);
router.post('/', createSale);
router.get('/summary', getSalesSummary);

module.exports = router;