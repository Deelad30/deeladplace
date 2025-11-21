const express = require('express');
const { getVendors, getProductsByVendorGrouped, getProductsByVendor, getAllProducts, createProduct, updateProduct, deleteProduct, getDashboardSummary } = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProductsByVendor);       
router.get('/all', getAllProducts);         
router.get('/dashboard-summary', getDashboardSummary);
router.get('/grouped', getProductsByVendorGrouped);
router.get('/vendors', getVendors);   

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);


module.exports = router;
