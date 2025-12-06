const Compute = require('../services/compute.service');

async function compute(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = Number(req.params.productId);

  // Accept optional parameters from frontend
  const { marginPercent, sellingPrice, batchSize } = req.body;

  try {
    const cost = await Compute.computeProductCost(productId, tenantId, {
      marginPercent: marginPercent != null ? Number(marginPercent) : null,
      sellingPrice: sellingPrice != null ? Number(sellingPrice) : null,
      batchSize: batchSize != null ? Number(batchSize) : null
    });

    res.json({
      ok: true,
      cost
    });
  } catch (err) {
    console.error('compute error:', err);
    res.status(500).json({ error: "Costing failed" });
  }
}

async function saveSnapshot(req, res) {
  const tenantId = req.user.tenant_id;
  const productId = Number(req.params.productId);
  const payload = req.body;

  await db.query(
    `INSERT INTO recipes_computed_snapshot
     (tenant_id, product_id, material_snapshot, cogs_per_unit, packaging_cost_per_unit,
      labour_cost_per_unit, total_cost_price, selling_price, margin_percent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [
      tenantId,
      productId,
      JSON.stringify(payload.material_snapshot || []),
      payload.COGS,
      payload.packaging_cost,
      payload.labour_cost,
      payload.TCOP,
      payload.selling_price,
      payload.margin_percent
    ]
  );

  res.json({ ok: true });
}

module.exports = { compute, saveSnapshot };
