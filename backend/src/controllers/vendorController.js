const database = require('../config/database');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getAllVendors = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM vendors ORDER BY name'
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      vendors: result.rows
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendorResult = await database.query(
      'SELECT * FROM vendors WHERE id = $1',
      [id]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Get vendor's products
    const productsResult = await database.query(
      'SELECT * FROM products WHERE vendor_id = $1 AND is_active = true ORDER BY name',
      [id]
    );
    
    res.json({
      success: true,
      vendor: {
        ...vendorResult.rows[0],
        products: productsResult.rows
      }
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor'
    });
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Admin/Manager)
const createVendor = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name is required'
      });
    }
    
    const result = await database.query(
      `INSERT INTO vendors (name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      vendor: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Vendor with this name already exists'
      });
    }
    
    console.error('Create vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor'
    });
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin/Manager)
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    
    const result = await database.query(
      `UPDATE vendors 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_active = COALESCE($3, is_active)
       WHERE id = $4 
       RETURNING *`,
      [name, description, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: result.rows[0]
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor'
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor
};