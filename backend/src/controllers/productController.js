const Product = require('../models/Product');
const { calculatePricing } = require('../utils/commissionCalculator');
const logger = require('../utils/logger');

//
// 🔹 CREATE PRODUCT (with tenant)
//
const createProduct = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

    const {
      name,
      description,
      vendor_price,
      custom_commission,
      sku,
      category_id,
      vendor_id
    } = req.body;

    const newProduct = await Product.create({
      name,
      description: description || '',
      vendor_price: vendor_price || 0,
      custom_commission: custom_commission || 0,
      category_id,
      sku,
      vendor_id: vendor_id || null,
      tenant_id: tenantId
    });

    return res.status(201).json({ success: true, product: newProduct });

  } catch (err) {
    logger.error('Create product error', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

//
// 🔹 GET ALL PRODUCTS (tenant scoped)
//
const getAllProducts = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const products = await Product.findAll(tenantId, limit, offset);
    const totalCount = await Product.getCountAll(tenantId);

    const productsWithPricing = products.map(product => ({
      ...product,
      ...calculatePricing(product.vendor_price, product.custom_commission)
    }));

    res.json({
      success: true,
      products: productsWithPricing,
      page,
      totalCount
    });

  } catch (error) {
    logger.error('Get all products error', { error: error.message, tenantId });
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
};

//
// 🔹 GET PRODUCTS BY VENDOR (tenant scoped)
//
const getProductsByVendor = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { vendor_id } = req.query;
  try {

    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: 'vendor_id is required'
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const products = await Product.findByVendor(tenantId, vendor_id, limit, offset);
    const totalCount = await Product.getCountByVendor(tenantId, vendor_id);

    const productsWithPricing = products.map(product => ({
      ...product,
      ...calculatePricing(product.vendor_price, product.custom_commission)
    }));

    res.json({
      success: true,
      vendor_id,
      page,
      totalCount,
      products: productsWithPricing
    });

  } catch (error) {
    logger.error('Get products by vendor error', { error: error.message, tenantId, vendor_id });
    res.status(500).json({ success: false, message: 'Error fetching vendor products' });
  }
};

//
// 🔹 UPDATE PRODUCT
//
const updateProduct = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const id = req.params.id;
  try {

    const updated = await Product.update(id, tenantId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updated });

  } catch (err) {
    logger.error('Update product error', { error: err.message, tenantId, productId: id });
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

//
// 🔹 DELETE PRODUCT
//
const deleteProduct = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const id = req.params.id;
  try {

    const deleted = await Product.delete(id, tenantId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, deletedId: id });

  } catch (err) {
    logger.error('Delete product error', { error: err.message, tenantId, productId: id });
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

//
// 🔹 VENDORS + GROUPINGS (tenant scoped)
//
const getProductsByVendorGrouped = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

    const rows = await Product.findAllGroupedByVendor(tenantId);

    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.vendor_id]) {
        acc[row.vendor_id] = {
          vendor_id: row.vendor_id,
          vendor_name: row.vendor_name,
          products: []
        };
      }
      if (row.product_id) {
        acc[row.vendor_id].products.push({
          id: row.product_id,
          name: row.product_name,
          vendor_price: row.vendor_price,
          custom_commission: row.custom_commission
        });
      }
      return acc;
    }, {});

    res.json({ success: true, vendors: Object.values(grouped) });

  } catch (err) {
    logger.error('Get grouped products error', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Error fetching grouped products' });
  }
};

const getVendors = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const vendors = await Product.findAllVendors(tenantId);
    res.json({ success: true, vendors });
  } catch (err) {
    logger.error('Get vendors error', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Error fetching vendors' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductsByVendor,
  updateProduct,
  deleteProduct,
  getProductsByVendorGrouped,
  getVendors
};
