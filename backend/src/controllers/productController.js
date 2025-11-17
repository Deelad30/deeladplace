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

    const products = await Product.findByVendor(vendor_id);
    
    const productsWithPricing = products.map(product => {
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

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    const productsWithPricing = products.map(product => {
      const pricing = calculatePricing(product.vendor_price, product.custom_commission);
      return { ...product, ...pricing };
    });

    res.json({
      success: true,
      count: productsWithPricing.length,
      products: productsWithPricing
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching all products' });
  }
};


module.exports = {
  getProductsByVendor,
  getAllProducts
};