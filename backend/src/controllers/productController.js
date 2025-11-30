const Product = require('../models/Product');
const { calculatePricing } = require('../utils/commissionCalculator');

//
// 🔹 CREATE PRODUCT (with tenant)
//
const createProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const {
      name,
      description,
      vendor_price,
      custom_commission,
      sku,
      category_id,
      vendor_id
    } = req.body;

    // === VALIDATION ===
    if (!name || !sku || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'name, sku and category_id are required'
      });
    }

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
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

//
// 🔹 GET ALL PRODUCTS (tenant scoped)
//
const getAllProducts = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
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
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
};

//
// 🔹 GET PRODUCTS BY VENDOR (tenant scoped)
//
const getProductsByVendor = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { vendor_id } = req.query;

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
    console.error('Get products by vendor error:', error);
    res.status(500).json({ success: false, message: 'Error fetching vendor products' });
  }
};

//
// 🔹 UPDATE PRODUCT
//
const updateProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const id = req.params.id;

    const updated = await Product.update(id, tenantId, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: updated });

  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

//
// 🔹 DELETE PRODUCT
//
const deleteProduct = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const id = req.params.id;

    const deleted = await Product.delete(id, tenantId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, deletedId: id });

  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

//
// 🔹 VENDORS + GROUPINGS (tenant scoped)
//
const getProductsByVendorGrouped = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

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
    console.error('Get grouped products error:', err);
    res.status(500).json({ success: false, message: 'Error fetching grouped products' });
  }
};

const getVendors = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const vendors = await Product.findAllVendors(tenantId);
    res.json({ success: true, vendors });
  } catch (err) {
    console.error('Get vendors error:', err);
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
