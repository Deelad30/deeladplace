const Product = require('../models/Product');
const { calculatePricing } = require('../utils/commissionCalculator');

const getProductsByVendor = async (req, res) => {
  try {
    const { vendor_id } = req.query;
    
    if (!vendor_id) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // fetch paginated products
    const products = await Product.findByVendor(vendor_id, limit, offset);

    // total count for pagination
    const totalCountResult = await Product.getCountByVendor(vendor_id);
    const totalCount = parseInt(totalCountResult);

    const productsWithPricing = products.map(product => {
      const pricing = calculatePricing(product.vendor_price, product.custom_commission);
      return { ...product, ...pricing };
    });

    res.json({
      success: true,
      count: productsWithPricing.length,
      totalCount,       // add total count here
      page,
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


const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const products = await Product.findAll(limit, offset);

    const productsWithPricing = products.map(product => {
      const pricing = calculatePricing(product.vendor_price, product.custom_commission);
      return { ...product, ...pricing };
    });

    const totalCount = await Product.getCountAll();

    res.json({
      success: true,
      products: productsWithPricing,
      page,
      totalCount
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error fetching all products' });
  }
};



const createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.params.id, req.body);
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.delete(req.params.id);
    res.json({ success: true, product: deletedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await Product.getSummary();
    res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching summary' });
  }
};

// Get products grouped by vendor
const getProductsByVendorGrouped = async (req, res) => {
  try {
    const rows = await Product.findAllGroupedByVendor();

    // Group products by vendor
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.vendor_id]) {
        acc[row.vendor_id] = {  vendor_id: row.vendor_id, vendor_name: row.vendor_name, products: [] };
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

// Fetch all vendors for dropdown
const getVendors = async (req, res) => {
  try {
    const vendors = await Product.findAllVendors();
    res.json({ success: true, vendors });
  } catch (err) {
    console.error('Get vendors error:', err);
    res.status(500).json({ success: false, message: 'Error fetching vendors' });
  }
};




module.exports = {
  getProductsByVendor,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardSummary,
  getProductsByVendorGrouped,
  getVendors,
};