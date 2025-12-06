const express = require('express');
const router = express.Router();
const LabourController = require('../controllers/labour.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', auth, requireTenant, LabourController.createLabour);
router.get('/', auth, requireTenant, LabourController.getLabour);
router.put('/:id', auth, requireTenant, LabourController.updateLabour);
router.delete('/:id', auth, requireTenant, LabourController.deleteLabour);

module.exports = router;
