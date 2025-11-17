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
    const summary = await Sale.getDailySummary();
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

module.exports = {
  createSale,
  getSalesSummary
};