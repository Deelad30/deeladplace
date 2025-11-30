// pos.controller.js
const db = require('../config/database');
const stockService = require('../services/stock.service');

// record sale
async function recordSale(req, res) {
  const tenantId = req.user.tenant_id;
  const { product_id, qty, selling_price, order_method, payment_method, vendor_id } = req.body;
  if (!product_id || qty === undefined || !selling_price) return res.status(400).json({ success: false, message: 'product_id, qty, selling_price required' });

  try {
    const sale = await db.query(
      `INSERT INTO pos_sales (tenant_id, user_id, product_id, qty, selling_price, order_method, payment_method, vendor_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tenantId, req.user.userId || req.user.userId, product_id, qty, selling_price, order_method || null, payment_method || null, vendor_id || null]
    );

    // On sale, create inventory movement outbound using standard cost if exists
    const stdRes = await db.query(
      `SELECT TCOP FROM standard_costs WHERE product_id = $1 AND tenant_id = $2 ORDER BY id DESC LIMIT 1`,
      [product_id, tenantId]
    );
    const std = stdRes.rows[0];
    const cost_per_unit = std ? Number(std.tcop || std.TCOP) : null;

    const total_cost = cost_per_unit ? Number(cost_per_unit) * Number(qty) : null;

    const movement = await db.query(
      `INSERT INTO stock_movements (tenant_id, item_type, item_id, movement_type, qty, cost_per_unit, total_cost, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [tenantId, 'product', product_id, 'out', qty, cost_per_unit, total_cost, req.user.userId || req.user.userId]
    );

    // update stock balance
    await stockService.upsertStockBalance(tenantId, 'product', product_id, -Number(qty), null);

    res.json({ success: true, sale: sale.rows[0], movement: movement.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record sale' });
  }
}

// close shift
async function closeShift(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.userId;

  try {
    // sum today's open sales for user
    const salesRes = await db.query(
      `SELECT SUM(qty) as total_units, SUM(qty * selling_price) as total_sales
       FROM pos_sales
       WHERE tenant_id = $1 AND user_id = $2 AND created_at >= current_date`,
      [tenantId, userId]
    );

    const total_units = Number(salesRes.rows[0].total_units || 0);
    const total_sales = Number(salesRes.rows[0].total_sales || 0);

    const shift = await db.query(
      `INSERT INTO pos_shifts (tenant_id, user_id, closed_at, total_sales, total_units, meta)
       VALUES ($1,$2,now(),$3,$4,$5) RETURNING *`,
      [tenantId, userId, total_sales, total_units, JSON.stringify({ closed_by: userId })]
    );

    res.json({ success: true, shift: shift.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to close shift' });
  }
}

module.exports = { recordSale, closeShift };
