const express = require('express');
const router = express.Router();
const pos = require('../controllers/pos.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/sale', auth, requireTenant, pos.recordSale);
router.post('/close-shift', auth, requireTenant, pos.closeShift);

module.exports = router;
