const express = require('express');
const router = express.Router();
const MaterialController = require('../controllers/material.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', auth, requireTenant, MaterialController.createMaterial);
router.get('/', auth, requireTenant, MaterialController.getMaterials);
router.put('/:id', auth, requireTenant, MaterialController.updateMaterial);
router.delete('/:id', auth, requireTenant, MaterialController.deleteMaterial);

module.exports = router;
