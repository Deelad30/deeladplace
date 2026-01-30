const purchaseService = require('../services/purchase.service');
const logger = require('../utils/logger');

exports.getPurchases = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const rows = await purchaseService.listPurchases(tenantId);
    res.json({ ok: true, items: rows });
  } catch (err) {
    logger.error('Failed to get purchases', { error: err.message, tenantId: req.user?.tenant_id });
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const userId = req.user.userId || req.user.id;

    const item = await purchaseService.createPurchase(tenantId, req.body, userId);

    res.json({ ok: true, purchase: item });
  } catch (err) {
    logger.error('Failed to create purchase', { error: err.message, tenantId: req.user?.tenant_id, userId: req.user?.id });
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const userId = req.user.userId || req.user.id;
    const purchaseId = req.params.id;

    const updated = await purchaseService.updatePurchase(
      tenantId,
      purchaseId,
      req.body,
      userId
    );

    res.json({ ok: true, purchase: updated });
  } catch (err) {
    logger.error('Failed to update purchase', { error: err.message, tenantId: req.user?.tenant_id, purchaseId: req.params.id });

    if (err.code === 'INVALID_QTY') {
      return res.status(400).json({ ok: false, message: err.message });
    }

    res.status(500).json({ ok: false, message: err.message });
  }
};


exports.deletePurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const userId = req.user.userId || req.user.id;
    const purchaseId = req.params.id;

    await purchaseService.deletePurchase(tenantId, purchaseId, userId);

    res.json({ ok: true });
  } catch (err) {
    logger.error('Failed to delete purchase', { error: err.message, tenantId: req.user?.tenant_id, purchaseId: req.params.id });

    // Pass through the specific error message
    return res.status(400).json({
      ok: false,
      message: err.message
    });
  }
};
