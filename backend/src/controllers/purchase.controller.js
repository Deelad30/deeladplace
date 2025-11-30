const db = require('../config/database');

async function createPurchase(req, res) {
  const tenantId = req.user.tenant_id;
  const { material_id, purchase_price, purchase_qty, vendor_id, purchase_date, recipe_qty, batch_qty, measurement_unit } = req.body;
  if (!material_id || !purchase_price || !purchase_qty) {
    return res.status(400).json({ error: 'material_id, purchase_price, purchase_qty required' });
  }
  try {
    const result = await db.query(
      `INSERT INTO material_purchases (tenant_id, material_id, purchase_price, purchase_qty, vendor_id, purchase_date, recipe_qty, batch_qty, measurement_unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tenantId, material_id, purchase_price, purchase_qty, vendor_id || null, purchase_date || null, recipe_qty || null, batch_qty || null, measurement_unit || null]
    );
    res.json({ ok: true, purchase: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create purchase failed' });
  }
}

module.exports = { createPurchase };
