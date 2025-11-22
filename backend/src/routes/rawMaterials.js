const express = require('express');
const router = express.Router();
const controller = require('../controllers/rawMaterialsController');

router.post('/', controller.createRawMaterial);
router.get('/', controller.getRawMaterials);
router.get('/:id', controller.getRawMaterial);
router.put('/:id', controller.updateRawMaterial);
router.delete('/:id', controller.deleteRawMaterial);

module.exports = router;
