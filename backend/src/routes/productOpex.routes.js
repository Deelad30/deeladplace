const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const controller = require('../controllers/productOpex.controller');

router.post('/', auth, requireTenant, controller.addProductOpex);
router.get('/:productId', auth, requireTenant, controller.getProductOpex);
router.put('/:id', auth, requireTenant, controller.updateOpexMapping);
router.delete('/:id', auth, requireTenant, controller.deleteOpexMapping);

module.exports = router;
