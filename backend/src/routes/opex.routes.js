const express = require('express');
const router = express.Router();

const OpexController = require('../controllers/opex.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', auth, requireTenant, OpexController.createOpex);
router.get('/', auth, requireTenant, OpexController.getOpex);

module.exports = router;
