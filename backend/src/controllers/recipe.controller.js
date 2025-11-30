const db = require('../config/database');

async function addRecipeItem(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = parseInt(req.params.productId, 10);
  const { material_id, recipe_qty, batch_qty, measurement_unit } = req.body;
  if (!material_id || !recipe_qty) return res.status(400).json({ error: 'material_id & recipe_qty required' });

  try {
    // Ensure product belongs to tenant (basic check)
    // Add recipe item table if you have recipe_items table; for simplicity assume recipes table exists to hold per product items
    await db.query(
      `INSERT INTO recipes (tenant_id, product_id, material_id, recipe_qty, batch_qty, measurement_unit)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [tenantId, productId, material_id, recipe_qty, batch_qty || 1, measurement_unit || null]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Add recipe item failed' });
  }
}

async function getRecipe(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = parseInt(req.params.productId, 10);
  const result = await db.query(`SELECT * FROM recipes WHERE tenant_id = $1 AND product_id = $2`, [tenantId, productId]);
  res.json({ ok: true, items: result.rows });
}

module.exports = { addRecipeItem, getRecipe };
