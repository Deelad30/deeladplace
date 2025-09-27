const express = require('express');
const { getAllVendors, getVendorById } = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllVendors);
router.get('/:id', getVendorById);

module.exports = router;