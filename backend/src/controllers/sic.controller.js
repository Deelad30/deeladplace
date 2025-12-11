// sic.controller.js
const db = require('../config/database');

// Raw SIC
// RAW MATERIAL SIC (with variance)
async function submitRawSIC(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;

  const {
    material_id,
    date,
    opening_qty = 0,
    issues_qty = 0,
    waste_qty = 0,
    closing_qty = 0,
    override_reason = null
  } = req.body;

  try {
    const duplicateRaw = await db.query(
      `SELECT id FROM sic_raw_materials
       WHERE tenant_id = $1 AND material_id = $2 AND date = $3`,
      [tenantId, material_id, date]
    );

    if (duplicateRaw.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Raw SIC for this material and date already exists.'
      });
    }

    const sysRes = await db.query(
      `SELECT COALESCE(SUM(qty), 0) AS system_usage
       FROM stock_movements
       WHERE tenant_id = $1
         AND item_type = 'material'
         AND item_id = $2
         AND movement_type = 'issue'
         AND DATE(created_at) = $3`,
      [tenantId, material_id, date]
    );

    const system_usage = Number(sysRes.rows[0].system_usage || 0);

    // 2️⃣ Expected usage from SIC formula
    const expected_usage =
      Number(opening_qty) +
      Number(issues_qty) -
      (Number(closing_qty) + Number(waste_qty));

    // 3️⃣ Variance = expected - system
    const variance = expected_usage - system_usage;

    // 4️⃣ Get cost per unit
    const costRes = await db.query(
      `SELECT COALESCE(AVG(cost_per_unit), 0) AS cost
       FROM stock_movements
       WHERE tenant_id = $1
         AND item_type = 'material'
         AND item_id = $2
         AND cost_per_unit IS NOT NULL`,
      [tenantId, material_id]
    );

    const cost_per_unit = Number(costRes.rows[0].cost || 0);
    const variance_value = variance * cost_per_unit;

    // 5️⃣ Insert SIC row
    const result = await db.query(
      `INSERT INTO sic_raw_materials
       (tenant_id, material_id, date,
        opening_qty, issues_qty, waste_qty, closing_qty,
        expected_usage, system_usage, variance, variance_value,
        override_reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        tenantId,
        material_id,
        date,
        opening_qty,
        issues_qty,
        waste_qty,
        closing_qty,
        expected_usage,
        system_usage,
        variance,
        variance_value,
        override_reason,
        userId
      ]
    );

    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit raw SIC'
    });
  }
}

// Product SIC
// PRODUCT SIC (with variance)
async function submitProductSIC(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;

  const {
    product_id,
    date,
    opening_qty = 0,
    issues_qty = 0,   // produced qty
    waste_qty = 0,
    closing_qty = 0,
    override_reason = null
  } = req.body;

  try {
   const duplicateProduct = await db.query(
  `SELECT id FROM sic_products
   WHERE tenant_id = $1 AND product_id = $2 AND date = $3`,
  [tenantId, product_id, date]
);

if (duplicateProduct.rows.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'SIC for this product and date has already been submitted.'
  });
}

    const sysRes = await db.query(
      `SELECT COALESCE(SUM(qty), 0) AS system_sales
       FROM pos_sales
       WHERE tenant_id = $1
         AND product_id = $2
         AND DATE(created_at) = $3`,
      [tenantId, product_id, date]
    );

    const system_sales = Number(sysRes.rows[0].system_sales || 0);

    // 2️⃣ Expected sales from SIC formula
    const expected_sales =
      Number(opening_qty) +
      Number(issues_qty) -
      (Number(closing_qty) + Number(waste_qty));

    // 3️⃣ Variance
    const variance = expected_sales - system_sales;

    // 4️⃣ Get TCOP (standard cost)
    const costRes = await db.query(
      `SELECT tcop
       FROM standard_costs
       WHERE tenant_id = $1 AND product_id = $2
       ORDER BY id DESC LIMIT 1`,
      [tenantId, product_id]
    );

    const tcop = Number(costRes.rows[0]?.tcop || 0);
    const variance_value = variance * tcop;

    // 5️⃣ Insert SIC row
    const result = await db.query(
      `INSERT INTO sic_products
       (tenant_id, product_id, date,
        opening_qty, issues_qty, waste_qty, closing_qty,
        expected_sales, system_sales, variance, variance_value,
        override_reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        tenantId,
        product_id,
        date,
        opening_qty,
        issues_qty,
        waste_qty,
        closing_qty,
        expected_sales,
        system_sales,
        variance,
        variance_value,
        override_reason,
        userId
      ]
    );

    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit product SIC'
    });
  }
}

// List Raw SIC
async function listRawSIC(req, res) {
  const tenantId = req.user.tenant_id;
  try {
    const result = await db.query(
      `SELECT * FROM sic_raw_materials WHERE tenant_id=$1 ORDER BY date DESC`,
      [tenantId]
    );
    res.json({ success: true, sic: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch raw SIC' });
  }
}

// List Product SIC
async function listProductSIC(req, res) {
  const tenantId = req.user.tenant_id;
  try {
    const result = await db.query(
      `SELECT * FROM sic_products WHERE tenant_id=$1 ORDER BY date DESC`,
      [tenantId]
    );
    res.json({ success: true, sic: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch product SIC' });
  }
}

module.exports = { 
  submitRawSIC, 
  submitProductSIC, 
  listRawSIC, 
  listProductSIC 
};
