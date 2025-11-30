// sic.controller.js
const db = require('../config/database');

// Raw SIC
async function submitRawSIC(req, res) {
  const tenantId = req.user.tenant_id;
  const { material_id, date, opening_qty = 0, issues_qty = 0, waste_qty = 0, closing_qty = 0, override_reason } = req.body;

  const computed_usage = Number(opening_qty) + Number(issues_qty) - Number(waste_qty) - Number(closing_qty);

  try {
    const result = await db.query(
      `INSERT INTO sic_raw_materials
       (tenant_id, material_id, date, opening_qty, issues_qty, waste_qty, closing_qty, computed_usage, override_reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenantId, material_id, date, opening_qty, issues_qty, waste_qty, closing_qty, computed_usage, override_reason || null, req.user.userId || req.user.userId]
    );

    // Auto carry closing -> create/update tomorrow opening could be handled in batch; we will not auto-create rows but provide helper API to fetch last closing
    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit raw SIC' });
  }
}

// Product SIC
async function submitProductSIC(req, res) {
  const tenantId = req.user.tenant_id;
  const { product_id, date, opening_qty = 0, issues_qty = 0, waste_qty = 0, closing_qty = 0, override_reason } = req.body;

  const computed_sales_qty = Number(opening_qty) + Number(issues_qty) - Number(waste_qty) - Number(closing_qty);

  try {
    const result = await db.query(
      `INSERT INTO sic_products
       (tenant_id, product_id, date, opening_qty, issues_qty, waste_qty, closing_qty, computed_sales_qty, override_reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenantId, product_id, date, opening_qty, issues_qty, waste_qty, closing_qty, computed_sales_qty, override_reason || null, req.user.userId || req.user.userId]
    );

    res.json({ success: true, sic: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to submit product SIC' });
  }
}

module.exports = { submitRawSIC, submitProductSIC };
