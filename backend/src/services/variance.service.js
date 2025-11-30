// variance.service.js
const db = require('../config/database');

async function recordVariance(tenantId, productId, standardCostId, actual) {
  // actual: { recipe_cost, packaging_cost, labour_cost, opex_cost, TCOP }
  const standard = await db.query(
    `SELECT * FROM standard_costs WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
    [standardCostId, tenantId]
  );
  if (standard.rows.length === 0) throw new Error('Standard cost not found');

  const s = standard.rows[0];
  const variance_recipe = (actual.recipe_cost || 0) - Number(s.recipe_cost || 0);
  const variance_packaging = (actual.packaging_cost || 0) - Number(s.packaging_cost || 0);
  const variance_labour = (actual.labour_cost || 0) - Number(s.labour_cost || 0);
  const variance_opex = (actual.opex_cost || 0) - Number(s.opex_cost || 0);
  const variance_total = (actual.TCOP || 0) - Number(s.tcop || s.TCOP || 0);

  const res = await db.query(
    `INSERT INTO cost_variances
     (tenant_id, product_id, standard_cost_id,
      actual_recipe_cost, actual_packaging_cost, actual_labour_cost, actual_opex_cost, actual_TCOP,
      variance_recipe, variance_packaging, variance_labour, variance_opex, variance_total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      tenantId, productId, standardCostId,
      actual.recipe_cost, actual.packaging_cost, actual.labour_cost, actual.opex_cost, actual.TCOP,
      variance_recipe, variance_packaging, variance_labour, variance_opex, variance_total
    ]
  );

  return res.rows[0];
}

module.exports = { recordVariance };
