// src/routes/product.routes.js

const express = require('express');
const router = express.Router();

const {
  getVendors,
  getProductsByVendorGrouped,
  getProductsByVendor,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { getProductSettings, saveProductSettings } = require('../controllers/productSettings.controller');

const auth = require('../middleware/auth.middleware');

// -------------------------------------------------------------
//  ALL PRODUCT ROUTES MUST BE AUTHENTICATED (tenant scoped)
// -------------------------------------------------------------
router.use(auth);

// -------------------------------------------------------------
//  PRODUCT CRUD
// -------------------------------------------------------------
router.post('/', createProduct);           // Create product
router.get('/all', getAllProducts);        // List all products
router.put('/:id', updateProduct);         // Update product
router.delete('/:id', deleteProduct);      // Delete product

// -------------------------------------------------------------
//  VENDOR-RELATED ROUTES
// -------------------------------------------------------------
router.get('/vendors', getVendors);        // List all vendors (tenant scoped)
router.get('/grouped', getProductsByVendorGrouped); // Vendor + product grouping
router.get('/', getProductsByVendor);      // Products by vendor_id
// Get batch & margin
router.get('/:id/settings', getProductSettings);

// Save batch & margin
router.post('/:id/settings', saveProductSettings);

module.exports = router;
