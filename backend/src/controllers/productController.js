const database = require('../config/database');

// @desc    Get all products (with optional vendor filter)
// @route   GET /api/products
// @access  Private
const getAllProducts = async (req, res) => {
  try {
    const { vendor_id } = req.query;
    
    let query = `
      SELECT p.*, v.name as vendor_name 
      FROM products p 
      JOIN vendors v ON p.vendor_id = v.id 
      WHERE p.is_active = true
    `;
    let params = [];
    
    if (vendor_id) {
      query += ' AND p.vendor_id = $1';
      params.push(vendor_id);
    }
    
    query += ' ORDER BY p.name';
    
    const result = await database.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query(
      `SELECT p.*, v.name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.id 
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin/Manager)
const createProduct = async (req, res) => {
  try {
    const { vendor_id, name, description, vendor_price, custom_commission } = req.body;
    
    if (!vendor_id || !name || !vendor_price) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, product name, and vendor price are required'
      });
    }
    
    const result = await database.query(
      `INSERT INTO products (vendor_id, name, description, vendor_price, custom_commission) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [vendor_id, name, description, vendor_price, custom_commission]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Manager)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, vendor_price, custom_commission, is_active } = req.body;
    
    const result = await database.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           vendor_price = COALESCE($3, vendor_price),
           custom_commission = COALESCE($4, custom_commission),
           is_active = COALESCE($5, is_active)
       WHERE id = $6 
       RETURNING *`,
      [name, description, vendor_price, custom_commission, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct
};