const express = require('express');
const { getProductsByVendor } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProductsByVendor);

module.exports = router;