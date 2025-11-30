const express = require('express');
const router = express.Router();
const standard = require('../controllers/standard.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/standardize/:productId', auth, requireTenant, standard.standardize);
router.post('/recompute/:productId', auth, requireTenant, standard.recomputeAndVariance);

module.exports = router;
