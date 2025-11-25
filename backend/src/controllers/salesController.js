// controllers/salesController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { calculatePricing } = require('../utils/commissionCalculator');

const createSale = async (req, res) => {
  try {
    const {
      vendor_id,
      product_id,
      quantity = 1,
      customer_type,
      payment_type,
      payment_breakdown
    } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const pricing = calculatePricing(product.vendor_price, product.custom_commission);
    const totalCustomerPrice = pricing.customerPrice * quantity;

    const sale = await Sale.create({
      vendor_id,
      product_id,
      quantity,
      vendor_price: product.vendor_price,
      hub_commission: pricing.commission * quantity,
      customer_price: totalCustomerPrice,
      customer_type,
      payment_type,
      payment_breakdown
    });

    res.status(201).json({
      success: true,
      message: 'Sale recorded successfully',
      sale
    });

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording sale'
    });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const summary = await Sale.getDailySummary(30);
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales summary'
    });
  }
};

// --------- New controllers ---------

const getOverview = async (req, res) => {
  try {
    const overviewRaw = await Sale.getOverview();
    // normalize numbers
    const overview = {
      today_revenue: Number(overviewRaw.today_revenue) || 0,
      month_revenue: Number(overviewRaw.month_revenue) || 0,
      total_transactions_30d: Number(overviewRaw.total_transactions_30d) || 0,
      average_order_value_30d: Number(overviewRaw.average_order_value_30d) || 0,
      total_commission_30d: Number(overviewRaw.total_commission_30d) || 0
    };
    res.json({ success: true, overview });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ success: false, message: 'Error fetching overview' });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const { start, end, limit = 10, by = 'revenue' } = req.query;
    const rows = await Sale.getTopProducts({ startDate: start || null, endDate: end || null, limit: Number(limit), by });
    res.json({ success: true, top_products: rows });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching top products' });
  }
};

const getPaymentSummary = async (req, res) => {
  try {
    const { start, end } = req.query;
    const summary = await Sale.getPaymentSummary({ startDate: start || null, endDate: end || null });
    res.json({ success: true, payment_summary: summary });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment summary' });
  }
};

const getSalesPaginated = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      start = null,
      end = null,
      vendor_id = null,
      product_id = null,
      payment_type = null
    } = req.query;

    const result = await Sale.getPaginatedSales({
      page: Number(page),
      limit: Number(limit),
      startDate: start || null,
      endDate: end || null,
      vendor_id: vendor_id || null,
      product_id: product_id || null,
      payment_type: payment_type || null
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Get paginated sales error:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales' });
  }
};

const getVendorsSummary = async (req, res) => {
  try {
    const { start = null, end = null, limit = 50 } = req.query;
    const rows = await Sale.getVendorsSummary({ startDate: start || null, endDate: end || null, limit: Number(limit) });
    res.json({ success: true, vendors: rows });
  } catch (error) {
    console.error('Get vendors summary error:', error);
    res.status(500).json({ success: false, message: 'Error fetching vendor summaries' });
  }
};

module.exports = {
  createSale,
  getSalesSummary,
  getOverview,
  getTopProducts,
  getPaymentSummary,
  getSalesPaginated,
  getVendorsSummary
};
