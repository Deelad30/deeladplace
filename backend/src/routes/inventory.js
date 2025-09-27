const express = require('express');
const {
  getRawMaterials,
  recordInventoryMovement,
  getInventoryMovements,
  getVarianceReport
} = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/materials', getRawMaterials);
router.get('/movements', getInventoryMovements);
router.post('/movements', recordInventoryMovement);
router.get('/variance', getVarianceReport);

module.exports = router;