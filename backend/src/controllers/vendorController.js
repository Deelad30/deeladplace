const Vendor = require('../models/Vendor');
const logger = require('../utils/logger');

exports.getAllVendors = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
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
    logger.error("Get vendors error", { error: error.message, tenantId });
    res.status(500).json({
      success: false,
      message: "Error fetching vendors"
    });
  }
};

exports.getVendorById = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const vendorId = req.params.id;
  try {

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
    logger.error("Get vendor error", { error: error.message, tenantId, vendorId });
    res.status(500).json({
      success: false,
      message: "Error fetching vendor"
    });
  }
};

exports.createVendor = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

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
    logger.error("Create vendor error", { error: error.message, tenantId });
    res.status(500).json({
      success: false,
      message: "Error creating vendor"
    });
  }
};

exports.updateVendor = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const vendorId = req.params.id;
  try {

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
    logger.error("Update vendor error", { error: error.message, tenantId, vendorId });
    res.status(500).json({
      success: false,
      message: "Error updating vendor"
    });
  }
};

exports.deleteVendor = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const vendorId = req.params.id;
  
  const database = require('../config/database');

  try {
    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    // Start a transaction
    await database.query('BEGIN');

    // 1. Soft delete the vendor (Prefixes name and sets is_deleted = true)
    const deleted = await Vendor.delete(vendorId, { tenantId });

    if (!deleted) {
      await database.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "Vendor not found"
      });
    }

    // 2. Deactivate all products belonging to this vendor
    await database.query(
      `UPDATE products 
       SET is_active = false, 
           updated_at = NOW() 
       WHERE vendor_id = $1 AND tenant_id = $2`,
      [vendorId, tenantId]
    );

    // Commit the transaction
    await database.query('COMMIT');

    res.json({
      success: true,
      message: "Vendor and related data (products) successfully deleted/deactivated. Historical financial records were preserved."
    });

  } catch (error) {
    await database.query('ROLLBACK');
    logger.error("Delete vendor error", { error: error.message, tenantId, vendorId });
    
    res.status(500).json({
      success: false,
      message: "Error deleting vendor"
    });
  }
};
