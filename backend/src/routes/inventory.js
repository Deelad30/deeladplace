const express = require('express');
const { createInventoryMovement, getLowStockAlerts } = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/movements', createInventoryMovement);
router.get('/low-stock', getLowStockAlerts);

module.exports = router;