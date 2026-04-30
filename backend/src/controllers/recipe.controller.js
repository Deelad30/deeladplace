const db = require('../config/database');
const logger = require('../utils/logger');

async function addRecipeItem(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = parseInt(req.params.productId, 10);
  const { material_id, recipe_qty, batch_qty, measurement_unit } = req.body;

  if (!material_id || !recipe_qty)
    return res.status(400).json({ error: 'material_id & recipe_qty required' });

  try {
    await db.query(
      `INSERT INTO recipes (tenant_id, product_id, material_id, recipe_qty, batch_qty, measurement_unit)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [tenantId, productId, material_id, recipe_qty, batch_qty || 1, measurement_unit || null]
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error('Add recipe item failed', { error: err.message, tenantId, productId, materialId: material_id });
    res.status(500).json({ error: 'Add recipe item failed' });
  }
}

async function getRecipe(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = parseInt(req.params.productId, 10);

  try {
    const result = await db.query(
      `SELECT r.id,
              r.material_id,
              m.name AS material_name,
              r.recipe_qty,
              r.batch_qty,
              m.measurement_unit,
              r.created_at,
              COALESCE((
                SELECT purchase_price / purchase_qty 
                FROM material_purchases 
                WHERE material_id = r.material_id AND tenant_id = r.tenant_id 
                ORDER BY purchase_date DESC, id DESC LIMIT 1
              ), 0) AS unit_cost
       FROM recipes r
       JOIN raw_materials m
         ON r.material_id = m.id
       WHERE r.tenant_id = $1 AND r.product_id = $2`,
      [tenantId, productId]
    );

    res.json({ ok: true, items: result.rows });
  } catch (err) {
    logger.error('Failed to load recipe', { error: err.message, tenantId, productId });
    res.status(500).json({ error: 'Failed to load recipe' });
  }
}


/* ⭐ NEW: UPDATE A RECIPE ITEM */
async function updateRecipeItem(req, res) {
  const tenantId = req.user.tenant_id;
  const itemId = parseInt(req.params.itemId, 10);
  const { material_id, recipe_qty, batch_qty, measurement_unit } = req.body;

  try {
    await db.query(
      `UPDATE recipes
       SET material_id = $1,
           recipe_qty = $2,
           batch_qty = $3,
           measurement_unit = $4
       WHERE id = $5 AND tenant_id = $6`,
      [material_id, recipe_qty, batch_qty, measurement_unit, itemId, tenantId]
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error('Update recipe item failed', { error: err.message, tenantId, itemId });
    res.status(500).json({ error: 'Update failed' });
  }
}

/* ⭐ NEW: DELETE A RECIPE ITEM */
async function deleteRecipeItem(req, res) {
  const tenantId = req.user.tenant_id;
  const itemId = parseInt(req.params.itemId, 10);

  try {
    await db.query(
      `DELETE FROM recipes WHERE id = $1 AND tenant_id = $2`,
      [itemId, tenantId]
    );

    res.json({ ok: true });
  } catch (err) {
    logger.error('Delete recipe item failed', { error: err.message, tenantId, itemId });
    res.status(500).json({ error: 'Delete failed' });
  }
}

module.exports = {
  addRecipeItem,
  getRecipe,
  updateRecipeItem,
  deleteRecipeItem
};
