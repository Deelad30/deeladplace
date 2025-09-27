const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', requireManagerOrAdmin, createProduct);
router.put('/:id', requireManagerOrAdmin, updateProduct);

module.exports = router;