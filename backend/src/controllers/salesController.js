const database = require('../config/database');

// @desc    Get all sales (with date range and vendor filter)
// @route   GET /api/sales
// @access  Private
const getAllSales = async (req, res) => {
  try {
    const { start_date, end_date, vendor_id } = req.query;
    
    let query = `
      SELECT s.*, v.name as vendor_name, p.name as product_name 
      FROM sales s 
      JOIN vendors v ON s.vendor_id = v.id 
      JOIN products p ON s.product_id = p.id 
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      query += ` AND s.sale_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND s.sale_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    if (vendor_id) {
      paramCount++;
      query += ` AND s.vendor_id = $${paramCount}`;
      params.push(vendor_id);
    }
    
    query += ' ORDER BY s.sale_date DESC';
    
    const result = await database.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      sales: result.rows
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales'
    });
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { vendor_id, product_id, quantity } = req.body;
    
    if (!vendor_id || !product_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, product ID, and quantity are required'
      });
    }
    
    // Get product details including commission
    const productResult = await database.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = productResult.rows[0];
    
    // Calculate commission
    let commission = 0;
    if (product.custom_commission) {
      commission = product.custom_commission;
    } else {
      // Default commission rule: ₦500 for items under ₦10,000, 5% for items above
      commission = product.vendor_price < 10000 ? 500 : product.vendor_price * 0.05;
    }
    
    const vendorPrice = product.vendor_price;
    const customerPrice = vendorPrice + commission;
    const totalCustomerPrice = customerPrice * quantity;
    const totalCommission = commission * quantity;
    
    // Insert sale
    const result = await database.query(
      `INSERT INTO sales (vendor_id, product_id, quantity, vendor_price, hub_commission, customer_price) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [vendor_id, product_id, quantity, vendorPrice, commission, customerPrice]
    );
    
    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale: result.rows[0],
      totals: {
        quantity,
        totalCustomerPrice,
        totalCommission
      }
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording sale'
    });
  }
};

// @desc    Get sales summary for dashboard
// @route   GET /api/sales/summary
// @access  Private
const getSalesSummary = async (req, res) => {
  try {
    // Today's sales
    const todayResult = await database.query(
      `SELECT 
         COUNT(*) as transaction_count,
         COALESCE(SUM(customer_price * quantity), 0) as total_revenue,
         COALESCE(SUM(hub_commission * quantity), 0) as total_commission
       FROM sales 
       WHERE sale_date::date = CURRENT_DATE`
    );

    // This month's sales
    const monthResult = await database.query(
      `SELECT 
         COUNT(*) as transaction_count,
         COALESCE(SUM(customer_price * quantity), 0) as total_revenue,
         COALESCE(SUM(hub_commission * quantity), 0) as total_commission
       FROM sales 
       WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)`
    );

    // Top vendors by sales
    const topVendorsResult = await database.query(
      `SELECT 
         v.name,
         COUNT(s.id) as sale_count,
         COALESCE(SUM(s.customer_price * s.quantity), 0) as total_revenue
       FROM vendors v
       LEFT JOIN sales s ON v.id = s.vendor_id AND s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY v.id, v.name
       ORDER BY total_revenue DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      summary: {
        today: todayResult.rows[0],
        thisMonth: monthResult.rows[0],
        topVendors: topVendorsResult.rows
      }
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales summary'
    });
  }
};

module.exports = {
  getAllSales,
  createSale,
  getSalesSummary
};