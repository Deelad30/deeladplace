const express = require('express');
const { createInventoryMovement, getAllStockLevels ,getLowStockAlerts, getMovementsByDate } = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/movements', createInventoryMovement);
router.get('/low-stock', getLowStockAlerts);
router.get('/all-stock', authenticateToken, getAllStockLevels);
router.get('/movements/:date', authenticateToken, getMovementsByDate);


module.exports = router;