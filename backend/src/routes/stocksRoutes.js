// src/routes/stocksRoutes.js
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');


// CRUD routes
router.post('/', auth, requireTenant, stockController.createStockItem);           // Create
router.get('/', auth, requireTenant, stockController.getStockItems);             // Get all
router.put('/:id', auth, requireTenant, stockController.updateStockItem);        // Update
router.delete('/:id', auth, requireTenant, stockController.deleteStockItem);     // Delete
router.patch('/:id/adjust', auth, requireTenant, stockController.adjustStockQuantity); // Adjust stock quantity
router.get('/test', (req, res) => {
  res.json({ success: true, message: "Stocks route works!" });
});


module.exports = router; 
