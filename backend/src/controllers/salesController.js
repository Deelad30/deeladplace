// controllers/salesController.js
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { calculatePricing } = require('../utils/commissionCalculator');
const logger = require('../utils/logger');

// ------------------------------------------------------
// CREATE SALE
// ------------------------------------------------------
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
      return res.status(404).json({ success: false, message: "Product not found" });
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
      payment_breakdown,
      tenant_id: req.user.tenant_id
    });

    res.status(201).json({ success: true, message: "Sale recorded successfully", sale });

  } catch (error) {
    logger.error("Create sale error", { error: error.message, vendor_id, product_id });
    res.status(500).json({ success: false, message: "Error recording sale" });
  }
};

// ------------------------------------------------------
// DAILY SUMMARY (FILTERED)
// ------------------------------------------------------
const getSalesSummary = async (req, res) => {
  try {
    const { start = null, end = null, vendor_id = null } = req.query;

    const summary = await Sale.getDailySummary({
      startDate: start,
      endDate: end,
      vendor_id,
      tenant_id: req.user.tenant_id
    });

    res.json({ success: true, summary });

  } catch (error) {
    logger.error("Get sales summary error", { error: error.message, vendor_id });
    res.status(500).json({ success: false, message: "Error fetching sales summary" });
  }
};

// ------------------------------------------------------
// OVERVIEW (FILTERED + FIXED)
// ------------------------------------------------------
const getOverview = async (req, res) => {
  try {
    const { start = null, end = null, vendor_id = null } = req.query;

    const data = await Sale.getOverview({
      startDate: start,
      endDate: end,
      vendor_id,
      tenant_id: req.user.tenant_id
    });

    const overview = {
      total_revenue: Number(data.total_revenue) || 0,
      total_commission: Number(data.total_commission) || 0,
      total_transactions: Number(data.total_transactions) || 0,
      average_order_value: Number(data.average_order_value) || 0
    };

    res.json({ success: true, overview });

  } catch (error) {
    logger.error("Get overview error", { error: error.message, vendor_id });
    res.status(500).json({ success: false, message: "Error fetching overview" });
  }
};

// ------------------------------------------------------
// TOP PRODUCTS
// ------------------------------------------------------
const getTopProducts = async (req, res) => {
  try {
    const {
      start = null,
      end = null,
      vendor_id = null,
      limit = 10
    } = req.query;

    const rows = await Sale.getTopProducts({
      startDate: start,
      endDate: end,
      vendor_id,
      limit: Number(limit),
      tenant_id: req.user.tenant_id
    });

    res.json({ success: true, top_products: rows });

  } catch (error) {
    logger.error("Get top products error", { error: error.message, vendor_id });
    res.status(500).json({ success: false, message: "Error fetching top products" });
  }
};

// ------------------------------------------------------
// PAYMENT SUMMARY
// ------------------------------------------------------
const getPaymentSummary = async (req, res) => {
  try {
    const {
      start = null,
      end = null,
      vendor_id = null
    } = req.query;

    const summary = await Sale.getPaymentSummary({
      startDate: start,
      endDate: end,
      vendor_id,
      tenant_id: req.user.tenant_id
    });

    res.json({ success: true, payment_summary: summary });

  } catch (error) {
    logger.error("Get payment summary error", { error: error.message, vendor_id });
    res.status(500).json({ success: false, message: "Error fetching payment summary" });
  }
};

// ------------------------------------------------------
// PAGINATED SALES
// ------------------------------------------------------
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
      startDate: start,
      endDate: end,
      vendor_id,
      product_id,
      payment_type,
      tenant_id: req.user.tenant_id
    });

    res.json({ success: true, ...result });

  } catch (error) {
    logger.error("Get paginated sales error", { error: error.message, vendor_id, product_id });
    res.status(500).json({ success: false, message: "Error fetching sales" });
  }
};

// ------------------------------------------------------
// VENDOR SUMMARY
// ------------------------------------------------------
const getVendorsSummary = async (req, res) => {
  try {
    const {
      start = null,
      end = null,
      vendor_id = null,
      limit = 50
    } = req.query;

    const rows = await Sale.getVendorsSummary({
      startDate: start,
      endDate: end,
      vendor_id,
      limit: Number(limit),
      tenant_id: req.user.tenant_id
    });

    res.json({ success: true, vendors: rows });

  } catch (error) {
    logger.error("Get vendors summary error", { error: error.message, vendor_id });
    res.status(500).json({ success: false, message: "Error fetching vendor summaries" });
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
