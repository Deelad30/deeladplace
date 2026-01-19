const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const controller = require('../controllers/productLabour.controller');

router.post('/', auth, requireTenant, controller.addProductLabour);
router.get('/:productId', auth, requireTenant, controller.getProductLabour);
router.put('/:id', auth, requireTenant, controller.updateLabourMapping);
router.delete('/:id', auth, requireTenant, controller.deleteLabourMapping);

module.exports = router;
