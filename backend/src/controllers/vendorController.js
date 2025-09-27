const Vendor = require('../models/Vendor');

const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors'
    });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor'
    });
  }
};

module.exports = {
  getAllVendors,
  getVendorById
};