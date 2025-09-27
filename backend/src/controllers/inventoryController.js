const database = require('../config/database');

// @desc    Get all raw materials
// @route   GET /api/inventory/materials
// @access  Private
const getRawMaterials = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM raw_materials ORDER BY name'
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      materials: result.rows
    });
  } catch (error) {
    console.error('Get raw materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching raw materials'
    });
  }
};

// @desc    Record inventory movement (SiCS)
// @route   POST /api/inventory/movements
// @access  Private
const recordInventoryMovement = async (req, res) => {
  try {
    const { raw_material_id, opening_stock, issues, waste, closing_stock, movement_date } = req.body;
    
    if (!raw_material_id || opening_stock === undefined || issues === undefined || waste === undefined || closing_stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Raw material ID, opening stock, issues, waste, and closing stock are required'
      });
    }
    
    // Calculate usage: (Opening + Issues) - (Closing + Waste)
    const usage = (opening_stock + issues) - (closing_stock + waste);
    
    const result = await database.query(
      `INSERT INTO inventory_movements (raw_material_id, opening_stock, issues, waste, closing_stock, movement_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [raw_material_id, opening_stock, issues, waste, closing_stock, movement_date]
    );
    
    res.status(201).json({
      success: true,
      message: 'Inventory movement recorded successfully',
      movement: result.rows[0],
      calculated_usage: usage
    });
  } catch (error) {
    console.error('Record inventory movement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording inventory movement'
    });
  }
};

// @desc    Get inventory movements for a date range
// @route   GET /api/inventory/movements
// @access  Private
const getInventoryMovements = async (req, res) => {
  try {
    const { start_date, end_date, raw_material_id } = req.query;
    
    let query = `
      SELECT im.*, rm.name as material_name, rm.unit 
      FROM inventory_movements im
      JOIN raw_materials rm ON im.raw_material_id = rm.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      query += ` AND im.movement_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND im.movement_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    if (raw_material_id) {
      paramCount++;
      query += ` AND im.raw_material_id = $${paramCount}`;
      params.push(raw_material_id);
    }
    
    query += ' ORDER BY im.movement_date DESC, rm.name';
    
    const result = await database.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      movements: result.rows
    });
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory movements'
    });
  }
};

// @desc    Get variance report (Check Sheet)
// @route   GET /api/inventory/variance
// @access  Private
const getVarianceReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // This is a simplified variance report. In a real scenario, you would compare
    // expected usage (from sales and recipes) vs actual usage (from inventory movements)
    
    const result = await database.query(
      `SELECT 
         rm.name as material_name,
         rm.unit,
         SUM(im.issues) as total_issues,
         SUM(im.waste) as total_waste,
         AVG(im.closing_stock) as avg_closing_stock
       FROM inventory_movements im
       JOIN raw_materials rm ON im.raw_material_id = rm.id
       WHERE im.movement_date BETWEEN $1 AND $2
       GROUP BY rm.id, rm.name, rm.unit
       ORDER BY rm.name`,
      [start_date || (new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], 
       end_date || new Date().toISOString().split('T')[0]]
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      varianceReport: result.rows
    });
  } catch (error) {
    console.error('Get variance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating variance report'
    });
  }
};

module.exports = {
  getRawMaterials,
  recordInventoryMovement,
  getInventoryMovements,
  getVarianceReport
};