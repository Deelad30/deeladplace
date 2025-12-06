const db = require('../config/database');

async function getProductSettings(req, res) {
  const productId = Number(req.params.id);
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT batch_qty, margin_percent FROM products WHERE id=$1 AND tenant_id=$2`,
      [productId, tenantId]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Product not found" });

    res.json({ ok: true, settings: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load product settings" });
  }
}

async function saveProductSettings(req, res) {
  const productId = Number(req.params.id);
  const tenantId = req.user.tenant_id;
  const { batch_qty, margin_percent } = req.body;

  if (batch_qty <= 0) return res.status(400).json({ error: "Batch quantity must be > 0" });

  try {
    const result = await db.query(
      `UPDATE products
       SET batch_qty=$1, margin_percent=$2
       WHERE id=$3 AND tenant_id=$4
       RETURNING *`,
      [batch_qty, margin_percent, productId, tenantId]
    );

    res.json({ ok: true, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save settings" });
  }
}

module.exports = { getProductSettings, saveProductSettings };
