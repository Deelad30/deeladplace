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

const createVendor = async (req, res) => {
  try {
    const newVendor = await Vendor.create(req.body);
    res.json({ success: true, vendor: newVendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating vendor" });
  }
}

// Update Vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVendor = await Vendor.update(id, req.body);

    if (!updatedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.json({
      success: true,
      message: "Vendor updated successfully",
      vendor: updatedVendor
    });

  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({
      success: false,
      message: "Error updating vendor"
    });
  }
};


// Delete Vendor
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVendor = await Vendor.delete(id);

    if (!deletedVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.json({
      success: true,
      message: "Vendor deleted successfully"
    });

  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting vendor"
    });
  }
};



module.exports = {
  getAllVendors,
  getVendorById,
  createVendor, 
  updateVendor,
  deleteVendor
};