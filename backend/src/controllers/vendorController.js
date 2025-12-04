const Vendor = require('../models/Vendor');

exports.getAllVendors = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const vendors = await Vendor.findAll({ tenantId });

    res.json({
      success: true,
      count: vendors.length,
      vendors
    });

  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendors"
    });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const vendorId = req.params.id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const vendor = await Vendor.findById(vendorId, { tenantId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    res.json({ success: true, vendor });

  } catch (error) {
    console.error("Get vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vendor"
    });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const vendorData = { ...req.body, tenant_id: tenantId };
    const newVendor = await Vendor.create(vendorData);

    res.json({
      success: true,
      vendor: newVendor
    });

  } catch (error) {
    console.error("Create vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating vendor"
    });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const vendorId = req.params.id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const updatedVendor = await Vendor.update(vendorId, req.body, { tenantId });

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
    console.error("Update vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating vendor"
    });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const vendorId = req.params.id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const deleted = await Vendor.delete(vendorId, { tenantId });

    if (!deleted) {
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
    console.error("Delete vendor error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting vendor"
    });
  }
};
