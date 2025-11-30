const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const PurchaseController = require('../controllers/purchase.controller');

router.post('/', auth, requireTenant, PurchaseController.createPurchase);

module.exports = router;
