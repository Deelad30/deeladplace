const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/material.controller');

router.get('/', auth, ctrl.getMaterials);
router.post('/', auth, ctrl.createMaterial);
router.put('/:id', auth, ctrl.updateMaterial);
router.delete('/:id', auth, ctrl.deleteMaterial);

module.exports = router;
