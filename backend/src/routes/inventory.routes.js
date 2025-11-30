const express = require('express');
const router = express.Router();
const inv = require('../controllers/inventory.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/movement', auth, requireTenant, inv.createMovement);

module.exports = router;
