const database = require('../config/database');
const { calculatePricing } = require('../utils/commissionCalculator');

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
    
    query += ' ORDER BY v.name, p.name';
    
    const result = await database.query(query, params);
    
    // Calculate pricing for each product
    const productsWithPricing = result.rows.map(product => {
      const pricing = calculatePricing(product.vendor_price, product.custom_commission);
      return {
        ...product,
        ...pricing
      };
    });
    
    res.json({
      success: true,
      count: productsWithPricing.length,
      products: productsWithPricing
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

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
    
    const product = result.rows[0];
    const pricing = calculatePricing(product.vendor_price, product.custom_commission);
    
    res.json({
      success: true,
      product: {
        ...product,
        ...pricing
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { vendor_id, name, description, vendor_price, custom_commission } = req.body;
    
    if (!vendor_id || !name || vendor_price === undefined) {
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
    
    const product = result.rows[0];
    const pricing = calculatePricing(product.vendor_price, product.custom_commission);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: {
        ...product,
        ...pricing
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

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
    
    const product = result.rows[0];
    const pricing = calculatePricing(product.vendor_price, product.custom_commission);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        ...product,
        ...pricing
      }
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