const express = require('express');
const router = express.Router();
const pos = require('../controllers/pos.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const { validate } = require('../middleware/validation');

router.post('/sale', auth, requireTenant, validate('recordSale'), pos.recordSale);
router.post('/close-shift', auth, requireTenant, pos.closeShift);
router.post('/open-shift', auth, requireTenant, pos.openShift); 

module.exports = router;
