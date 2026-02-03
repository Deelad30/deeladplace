// sic.controller.js
const db = require('../config/database');
const logger = require('../utils/logger');

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

    // 1. Calculate EXPECTED usage from Recipes x Sales
    const expectedRes = await db.query(
      `SELECT COALESCE(SUM(r.recipe_qty * ps.qty), 0) AS expected_usage
       FROM recipes r
       JOIN pos_sales ps ON ps.product_id = r.product_id
       WHERE r.material_id = $1
         AND ps.tenant_id = $2
         AND DATE(ps.created_at) = $3`,
      [material_id, tenantId, date]
    );
    const expected_usage = Number(expectedRes.rows[0].expected_usage || 0);

    // 2. Calculate ACTUAL usage from manual physical counts
    // Formula: actual_usage = opening + issues - (waste + closing)
    const actual_usage =
      Number(opening_qty) +
      Number(issues_qty) -
      (Number(closing_qty) + Number(waste_qty));

    // 3. Calculate Variance
    // Formula: variance = expected - actual
    const variance = expected_usage - actual_usage;

    // 4. Get Cost for Variance Value
    const costRes = await db.query(
      `SELECT COALESCE(average_cost, 0) AS cost
       FROM stock_balance
       WHERE tenant_id = $1
         AND item_type = 'material'
         AND item_id = $2`,
      [tenantId, material_id]
    );
    const cost_per_unit = Number(costRes.rows[0]?.cost || 0);
    const variance_value = variance * cost_per_unit;

    // 5. Save to DB (repurposing columns to avoid schema changes for now, but logical names match)
    // expected_usage (DB col) -> expected_usage (Recipe)
    // system_usage (DB col) -> actual_usage (Manual)
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
        expected_usage, // recipe usage
        actual_usage,   // manual count results
        variance,
        variance_value,
        override_reason,
        userId
      ]
    );

    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    logger.error('Failed to submit raw SIC', { error: err.message, tenantId, materialId: material_id });
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

    // 1. Expected sales from SYSTEM (POS)
    const sysRes = await db.query(
      `SELECT COALESCE(SUM(qty), 0) AS system_sales
       FROM pos_sales
       WHERE tenant_id = $1
         AND product_id = $2
         AND DATE(created_at) = $3`,
      [tenantId, product_id, date]
    );
    const expected_sales = Number(sysRes.rows[0].system_sales || 0);

    // 2. Actual sales from PHYSICAL counting
    // Formula: actual_sales = opening + issues - (waste + closing)
    const actual_sales =
      Number(opening_qty) +
      Number(issues_qty) -
      (Number(closing_qty) + Number(waste_qty));

    // 3. Variance
    // Formula: variance = expected - actual
    const variance = expected_sales - actual_sales;

    // 4. Get TCOP for Variance Value
    const costRes = await db.query(
      `SELECT tcop
       FROM standard_costs
       WHERE tenant_id = $1 AND product_id = $2
       ORDER BY id DESC LIMIT 1`,
      [tenantId, product_id]
    );

    const tcop = Number(costRes.rows[0]?.tcop || 0);
    const variance_value = variance * tcop;

    // 5. Save to DB
    // expected_sales (DB col) -> expected_sales (System)
    // system_sales (DB col) -> actual_sales (Manual)
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
        expected_sales, // POS Sales
        actual_sales,   // Manual Sales Count
        variance,
        variance_value,
        override_reason,
        userId
      ]
    );

    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    logger.error('Failed to submit product SIC', { error: err.message, tenantId, productId: product_id });
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
    logger.error('Failed to fetch raw SIC', { error: err.message, tenantId });
    res.status(500).json({ success: true, message: 'Failed to fetch raw SIC' });
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
    logger.error('Failed to fetch product SIC', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch product SIC' });
  }
}

async function getLatestRawSIC(req, res) {
  const tenantId = req.user.tenant_id;
  try {
    // Get the most recent entry for each material
    const result = await db.query(
      `SELECT DISTINCT ON (material_id) *
       FROM sic_raw_materials
       WHERE tenant_id = $1
       ORDER BY material_id, date DESC, created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, sic: result.rows });
  } catch (err) {
    logger.error('Failed to fetch latest raw SIC', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch latest raw SIC' });
  }
}

async function getLatestProductSIC(req, res) {
  const tenantId = req.user.tenant_id;
  try {
    const result = await db.query(
      `SELECT DISTINCT ON (product_id) *
       FROM sic_products
       WHERE tenant_id = $1
       ORDER BY product_id, date DESC, created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, sic: result.rows });
  } catch (err) {
    logger.error('Failed to fetch latest product SIC', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch latest product SIC' });
  }
}

// sic.controller.js
async function getRawSICReport(req, res) {
  const tenantId = req.user.tenant_id;
  const { startDate, endDate, createdBy, materialId } = req.query;

  try {
    let filters = ["sr.tenant_id = $1"];
    let values = [tenantId];
    let idx = 2;

    if (startDate) {
      filters.push(`sr.date >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      filters.push(`sr.date <= $${idx++}`);
      values.push(endDate);
    }

    if (createdBy) {
      filters.push(`sr.created_by = $${idx++}`);
      values.push(createdBy);
    }

    if (materialId) {
      filters.push(`sr.material_id = $${idx++}`);
      values.push(materialId);
    }

    const sql = `
      SELECT sr.*, m.name AS material_name, u.name AS submitted_by
      FROM sic_raw_materials sr
      LEFT JOIN raw_materials m ON m.id = sr.material_id
      LEFT JOIN users u ON u.id = sr.created_by
      WHERE ${filters.join(" AND ")}
      ORDER BY sr.date DESC, sr.created_at DESC
    `;

    const { rows } = await db.query(sql, values);
    res.json({ success: true, report: rows });
  } catch (err) {
    logger.error('Failed to fetch raw SIC report', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch raw SIC report' });
  }
}

async function getProductSICReport(req, res) {
  const tenantId = req.user.tenant_id;
  const { startDate, endDate, createdBy, productId, vendorId } = req.query;

  try {
    let filters = ["sp.tenant_id = $1"];
    let values = [tenantId];
    let idx = 2;

    if (startDate) {
      filters.push(`sp.date >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      filters.push(`sp.date <= $${idx++}`);
      values.push(endDate);
    }

    if (createdBy) {
      filters.push(`sp.created_by = $${idx++}`);
      values.push(createdBy);
    }

    if (productId) {
      filters.push(`sp.product_id = $${idx++}`);
      values.push(productId);
    }

    if (vendorId) {
      filters.push(`p.vendor_id = $${idx++}`);
      values.push(vendorId);
    }

    const sql = `
      SELECT sp.*, p.name AS product_name, u.name AS submitted_by
      FROM sic_products sp
      LEFT JOIN products p ON p.id = sp.product_id
      LEFT JOIN users u ON u.id = sp.created_by
      WHERE ${filters.join(" AND ")}
      ORDER BY sp.date DESC, sp.created_at DESC
    `;

    const { rows } = await db.query(sql, values);
    res.json({ success: true, report: rows });
  } catch (err) {
    logger.error('Failed to fetch product SIC report', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch product SIC report' });
  }
}


module.exports = { 
  submitRawSIC, 
  submitProductSIC, 
  listRawSIC, 
  listProductSIC,
  getLatestRawSIC,
  getLatestProductSIC,
  getRawSICReport,
  getProductSICReport 
};
