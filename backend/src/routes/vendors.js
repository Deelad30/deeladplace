const express = require('express');
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor
} = require('../controllers/vendorController');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authenticateToken);

// Routes
router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.post('/', requireManagerOrAdmin, createVendor);
router.put('/:id', requireManagerOrAdmin, updateVendor);

module.exports = router;