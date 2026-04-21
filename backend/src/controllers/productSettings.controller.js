const db = require('../config/database');
const logger = require('../utils/logger');

async function getProductSettings(req, res) {
  const productId = Number(req.params.id);
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT batch_qty, margin_percent, selling_price, tcop FROM products WHERE id=$1 AND tenant_id=$2`,
      [productId, tenantId]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Product not found" });

    res.json({ ok: true, settings: result.rows[0] });
  } catch (err) {
    logger.error('Failed to load product settings', { error: err.message, tenantId, productId });
    res.status(500).json({ error: "Failed to load product settings" });
  }
}

async function saveProductSettings(req, res) {
  const productId = Number(req.params.id);
  const tenantId = req.user.tenant_id;
  const { batch_qty, margin_percent, selling_price } = req.body;

  if (batch_qty <= 0) return res.status(400).json({ error: "Batch quantity must be > 0" });

  try {
    const result = await db.query(
      `UPDATE products
       SET batch_qty=$1, margin_percent=$2, selling_price=$3
       WHERE id=$4 AND tenant_id=$5
       RETURNING *`,
      [batch_qty, margin_percent, selling_price, productId, tenantId]
    );

    res.json({ ok: true, product: result.rows[0] });
  } catch (err) {
    logger.error('Failed to save product settings', { error: err.message, tenantId, productId });
    res.status(500).json({ error: "Failed to save settings" });
  }
}

module.exports = { getProductSettings, saveProductSettings };
