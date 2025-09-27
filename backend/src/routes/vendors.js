const express = require('express');
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor
} = require('../controllers/vendorController');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.post('/', requireManagerOrAdmin, createVendor);
router.put('/:id', requireManagerOrAdmin, updateVendor);

module.exports = router;