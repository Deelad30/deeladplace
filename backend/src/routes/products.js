const express = require('express');
const { getProductsByVendor, getAllProducts } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getProductsByVendor);       // vendor-specific
router.get('/all', getAllProducts);         // all products

module.exports = router;
