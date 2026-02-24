const RawMaterial = require('../models/RawMaterial');
const logger = require('../utils/logger');

/**
 * CREATE (tenant-scoped)
 */
exports.createRawMaterial = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Missing tenant ID' });
    }

    const { name, unit, current_cost, min_stock_level } = req.body;

    const material = await RawMaterial.create({
      tenant_id: tenantId,
      name,
      unit,
      current_cost,
      min_stock_level
    });

    res.status(201).json({
      success: true,
      material
    });

  } catch (error) {
    logger.error('Create raw material error', { error: error.message, tenantId: req.user?.tenant_id });
    res.status(500).json({
      success: false,
      message: 'Error creating raw material'
    });
  }
};


/**
 * GET ALL (tenant-scoped)
 */
exports.getRawMaterials = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const materials = await RawMaterial.findAll({ tenantId });

    res.json({
      success: true,
      materials
    });

  } catch (error) {
    logger.error('Get raw materials error', { error: error.message, tenantId: req.user?.tenant_id });
    res.status(500).json({
      success: false,
      message: 'Error fetching raw materials'
    });
  }
};


/**
 * GET BY ID (tenant-scoped)
 */
exports.getRawMaterial = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const material = await RawMaterial.findById(id, { tenantId });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    res.json({
      success: true,
      material
    });

  } catch (error) {
    logger.error('Get raw material error', { error: error.message, tenantId: req.user?.tenant_id, materialId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Error fetching raw material'
    });
  }
};


/**
 * UPDATE (tenant-scoped)
 */
exports.updateRawMaterial = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const updated = await RawMaterial.update(id, req.body, { tenantId });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    res.json({
      success: true,
      material: updated
    });

  } catch (error) {
    logger.error('Update raw material error', { error: error.message, tenantId: req.user?.tenant_id, materialId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Error updating raw material'
    });
  }
};


/**
 * DELETE (tenant-scoped)
 */
exports.deleteRawMaterial = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const deleted = await RawMaterial.delete(id, { tenantId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found'
      });
    }

    res.json({
      success: true,
      message: 'Raw material deleted successfully'
    });

  } catch (error) {
    logger.error('Delete raw material error', { error: error.message, tenantId: req.user?.tenant_id, materialId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Error deleting raw material'
    });
  }
};
