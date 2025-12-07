// standard.controller.js
const db = require('../config/database') ;
const Compute = require('../services/compute.service');
const varianceService = require('../services/variance.service');

async function standardize(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = Number(req.params.productId);
  const { marginPercent } = req.body;

  try {
    // Compute actual cost including TCOP and selling price
    const actual = await Compute.computeProductCost(productId, tenantId, { marginPercent });

    // Save snapshot in standard_costs table
    const insert = await db.query(
      `INSERT INTO standard_costs
       (tenant_id, product_id, recipe_cost, packaging_cost, labour_cost, opex_cost, COGS, TCOP, margin_percent, selling_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        tenantId,
        productId,
        actual.recipe_cost,
        actual.packaging_cost,
        actual.labour_cost,
        actual.opex_cost,
        actual.COGS,
        actual.TCOP,
        actual.margin_percent,
        actual.selling_price
      ]
    );
    await db.query(
      `UPDATE products
       SET tcop = $1,
           margin_price = $2,
           selling_price = $3
       WHERE id = $4 AND tenant_id = $5`,
      [actual.TCOP, actual.selling_price - actual.TCOP, actual.selling_price, productId, tenantId]
    );

    res.json({ success: true, standard: insert.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to standardize cost' });
  }
}

async function recomputeAndVariance(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = Number(req.params.productId);

  try {
    // fetch latest standard cost
    const stdRes = await db.query(
      `SELECT * FROM standard_costs WHERE tenant_id = $1 AND product_id = $2 ORDER BY id DESC LIMIT 1`,
      [tenantId, productId]
    );
    if (stdRes.rows.length === 0) return res.status(400).json({ success: false, message: 'No standard cost found' });

    const standard = stdRes.rows[0];

    // compute actual
    const actual = await Compute.computeProductCost(productId, tenantId, { marginPercent: standard.margin_percent });

    // record variance
    const variance = await varianceService.recordVariance(tenantId, productId, standard.id, {
      recipe_cost: actual.recipe_cost,
      packaging_cost: actual.packaging_cost,
      labour_cost: actual.labour_cost,
      opex_cost: actual.opex_cost,
      TCOP: actual.TCOP
    });

    res.json({ success: true, actual, standard, variance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to recompute variance' });
  }
}

async function recomputeAndVariance(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = Number(req.params.productId);

  try {
    // fetch latest standard cost
    const stdRes = await db.query(
      `SELECT * FROM standard_costs WHERE tenant_id = $1 AND product_id = $2 ORDER BY id DESC LIMIT 1`,
      [tenantId, productId]
    );
    if (stdRes.rows.length === 0) return res.status(400).json({ success: false, message: 'No standard cost found' });

    const standard = stdRes.rows[0];

    // compute actual
    const actual = await Compute.computeProductCost(productId, tenantId, { marginPercent: standard.margin_percent });

    // record variance
    const variance = await varianceService.recordVariance(tenantId, productId, standard.id, {
      recipe_cost: actual.recipe_cost,
      packaging_cost: actual.packaging_cost,
      labour_cost: actual.labour_cost,
      opex_cost: actual.opex_cost,
      TCOP: actual.TCOP
    });

    res.json({ success: true, actual, standard, variance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to recompute variance' });
  }
}

module.exports = { standardize, recomputeAndVariance };
