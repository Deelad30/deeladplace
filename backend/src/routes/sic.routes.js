const express = require('express');
const router = express.Router();
const sic = require('../controllers/sic.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/raw', auth, requireTenant, sic.submitRawSIC);
router.post('/product', auth, requireTenant, sic.submitProductSIC);

module.exports = router;
