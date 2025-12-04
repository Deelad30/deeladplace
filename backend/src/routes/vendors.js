const express = require('express');
const { getAllVendors, getVendorById, createVendor,  updateVendor, deleteVendor  } = require('../controllers/vendorController');

const auth = require('../middleware/auth.middleware');

const router = express.Router();


router.get('/', auth, getAllVendors);
router.get('/:id', auth, getVendorById);
router.post('/', auth, createVendor);
router.put('/:id', auth, updateVendor);  
router.delete('/:id', auth, deleteVendor); 

module.exports = router;