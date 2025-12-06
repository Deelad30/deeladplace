const express = require('express');
const router = express.Router();

const PackagingMapController = require('../controllers/packagingMap.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', auth, requireTenant, PackagingMapController.addPackagingToProduct);
router.get('/:productId', auth, requireTenant, PackagingMapController.getProductPackaging);
router.put('/:id', auth, requireTenant, PackagingMapController.updatePackagingMapping);
router.delete('/:id', auth, requireTenant, PackagingMapController.deletePackagingMapping);


module.exports = router;
