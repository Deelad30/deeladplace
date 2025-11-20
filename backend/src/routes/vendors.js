const express = require('express');
const { getAllVendors, getVendorById, createVendor,  updateVendor, deleteVendor  } = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllVendors);
router.get('/:id', getVendorById);
router.post('/', createVendor);
router.put('/:id', updateVendor);  
router.delete('/:id', deleteVendor); 

module.exports = router;