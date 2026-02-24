const express = require('express');
const router = express.Router();
const posBills = require('../controllers/posBills.controller');
const { authenticateToken, requireNonWaiter, requireManagerOrAdmin } = require('../middleware/auth');
const { requireTenant } = require('../middleware/tenant.middleware');

router.post('/', authenticateToken, requireTenant, posBills.createOrUpdateBill);
router.get('/', authenticateToken, requireTenant, posBills.getActiveBills);
router.get('/:id', authenticateToken, requireTenant, posBills.getBillDetails);
router.post('/:id/settle', authenticateToken, requireTenant, requireNonWaiter, posBills.settleBill);
router.delete('/:id', authenticateToken, requireTenant, requireManagerOrAdmin, posBills.voidBill);

module.exports = router;
