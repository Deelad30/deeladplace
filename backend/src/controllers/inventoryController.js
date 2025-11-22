const Inventory = require('../models/Inventory');

const createInventoryMovement = async (req, res) => {
  try {
    const { raw_material_id, opening, issues, waste, closing, movement_date } = req.body;

    const movement = await Inventory.createMovement({
      raw_material_id,
      opening,
      issues,
      waste,
      closing,
      movement_date: movement_date || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Inventory movement recorded successfully',
      movement
    });

  } catch (error) {
    console.error('Create inventory movement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording inventory movement'
    });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.getLowStockAlerts();
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock alerts'
    });
  }
};


const getAllStockLevels = async (req, res) => {
  try {
    const data = await Inventory.getAllStockLevels();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get all stock levels error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stock levels' });
  }
};

const getMovementsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const movements = await Inventory.getMovementsByDate(date);
    res.json({ success: true, data: movements });
  } catch (err) {
    console.error('Get movements by date error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch movements' });
  }
};




module.exports = {
  createInventoryMovement,
  getLowStockAlerts,  
  getAllStockLevels,
  getMovementsByDate
};