const express = require('express');
const router = express.Router();

const {
  createRawMaterial,
  getRawMaterials,
  getRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} = require('../controllers/rawMaterialsController');

const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

// CREATE
router.post('/', auth, requireTenant, createRawMaterial);

// GET ALL
router.get('/', auth, requireTenant, getRawMaterials);

// GET BY ID
router.get('/:id', auth, requireTenant, getRawMaterial);

// UPDATE
router.put('/:id', auth, requireTenant, updateRawMaterial);

// DELETE
router.delete('/:id', auth, requireTenant, deleteRawMaterial);

module.exports = router;
