const database = require('../config/database');
const { calculatePricing } = require('../utils/commissionCalculator');

const createSale = async (req, res) => {
  try {
    const { vendor_id, product_id, quantity = 1 } = req.body;

    if (!vendor_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID and Product ID are required'
      });
    }

    // Get product details
    const productResult = await database.query(
      `SELECT p.*, v.name as vendor_name 
       FROM products p 
       JOIN vendors v ON p.vendor_id = v.id 
       WHERE p.id = $1 AND p.vendor_id = $2`,
      [product_id, vendor_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for the specified vendor'
      });
    }

    const product = productResult.rows[0];
    const pricing = calculatePricing(product.vendor_price, product.custom_commission);

    // Create sale record
    const saleResult = await database.query(
      `INSERT INTO sales (vendor_id, product_id, quantity, vendor_price, hub_commission, customer_price) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [vendor_id, product_id, quantity, product.vendor_price, pricing.commission, pricing.customerPrice * quantity]
    );

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale: saleResult.rows[0]
    });

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording sale'
    });
  }
};

const getSales = async (req, res) => {
  try {
    const { start_date, end_date, vendor_id } = req.query;
    
    let query = `
      SELECT s.*, v.name as vendor_name, p.name as product_name 
      FROM sales s
      JOIN vendors v ON s.vendor_id = v.id
      JOIN products p ON s.product_id = p.id
    `;
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      conditions.push(`s.sale_date >= $${paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      conditions.push(`s.sale_date <= $${paramCount}`);
      params.push(end_date);
    }

    if (vendor_id) {
      paramCount++;
      conditions.push(`s.vendor_id = $${paramCount}`);
      params.push(vendor_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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

const getSalesSummary = async (req, res) => {
  try {
    // Today's summary
    const todayResult = await database.query(
      `SELECT COUNT(*) as transaction_count, 
              SUM(customer_price) as total_revenue, 
              SUM(hub_commission) as total_commission 
       FROM sales 
       WHERE DATE(sale_date) = CURRENT_DATE`
    );

    // This month's summary
    const monthResult = await database.query(
      `SELECT COUNT(*) as transaction_count, 
              SUM(customer_price) as total_revenue, 
              SUM(hub_commission) as total_commission 
       FROM sales 
       WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    res.json({
      success: true,
      summary: {
        today: todayResult.rows[0],
        this_month: monthResult.rows[0]
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
  createSale,
  getSales,
  getSalesSummary
};