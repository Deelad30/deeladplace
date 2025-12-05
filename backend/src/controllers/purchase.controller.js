const purchaseService = require('../services/purchase.service');

exports.getPurchases = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const rows = await purchaseService.listPurchases(tenantId);
    res.json({ ok: true, items: rows });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const item = await purchaseService.createPurchase(tenantId, req.body);
    res.json({ ok: true, purchase: item });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};
