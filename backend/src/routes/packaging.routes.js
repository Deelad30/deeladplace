const express = require('express');
const router = express.Router();

const PackagingController = require('../controllers/packaging.controller');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', auth, requireTenant, PackagingController.createPackaging);
router.get('/', auth, requireTenant, PackagingController.getPackaging);
router.put('/:id', auth, requireTenant, PackagingController.updatePackaging);
router.delete('/:id', auth, requireTenant, PackagingController.deletePackaging);


module.exports = router;
