const express = require('express');
const router = express.Router();
const CostingController = require('../controllers/costing.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/compute/:productId', auth, requireTenant, CostingController.compute);
router.post('/snapshot/:productId', auth, requireTenant, CostingController.saveSnapshot);

module.exports = router;
