const express = require('express');
const router = express.Router();
const sic = require('../controllers/sic.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

// Existing POST routes
router.post('/raw', auth, requireTenant, sic.submitRawSIC);
router.post('/product', auth, requireTenant, sic.submitProductSIC);

// Add GET routes for listing
router.get('/raw', auth, requireTenant, sic.listRawSIC);
router.get('/product', auth, requireTenant, sic.listProductSIC);

module.exports = router;
