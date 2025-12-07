// pos.controller.js
const db = require('../config/database');
const stockService = require('../services/stock.service');

// record sale
async function recordSale(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;

  const {
  product_id,
  qty,
  selling_price,
  payment_method,
  payment_breakdown = [],
  order_method,

  vendor_id,
  commission = 0,
  shift_id
} = req.body;


  // Validate
  if (!product_id || qty === undefined || !selling_price) {
    return res.status(400).json({
      success: false,
      message: 'product_id, qty, selling_price are required'
    });
  }

  try {
    // 1️⃣ Insert sale record (NO reference)
    const saleRes = await db.query(
  `INSERT INTO pos_sales
    (tenant_id, user_id, product_id, qty, selling_price,
     payment_method, order_method,
     vendor_id, commission, shift_id, payment_breakdown)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
   RETURNING *`,
  [
    tenantId,
    userId,
    product_id,
    qty,
    selling_price,
    payment_method,
    order_method,
    vendor_id,
    commission,
    shift_id,
    JSON.stringify(payment_breakdown)
  ]
);


    const sale = saleRes.rows[0];

    // 2️⃣ Fetch standard cost (TCOP)
    const stdRes = await db.query(
      `SELECT tcop
       FROM standard_costs
       WHERE tenant_id = $1 AND product_id = $2
       ORDER BY id DESC
       LIMIT 1`,
      [tenantId, product_id]
    );

    const standard = stdRes.rows[0];
    const cost_per_unit = standard ? Number(standard.tcop) : 0;
    const total_cost = Number(cost_per_unit) * Number(qty);

    // 3️⃣ Create stock movement
    const movement = await stockService.recordStockMovement({
      tenantId,
      itemType: 'product',
      itemId: product_id,
      qty,
      movementType: 'sale',
      costPerUnit: cost_per_unit,
      createdBy: userId
    });

    // 4️⃣ Reduce stock balance
    await stockService.upsertStockBalance(
      tenantId,
      'product',
      product_id,
      -Number(qty),
      cost_per_unit
    );

    res.json({
      success: true,
      sale,
      movement
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to record sale'
    });
  }
}


// close shift
// pos.controller.js
async function closeShift(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;
  const { shift_id } = req.body;

  if (!shift_id) {
    return res.status(400).json({ success: false, message: 'shift_id is required' });
  }

  try {
    // 1️⃣ Get the shift info
    const shiftRes = await db.query(
      `SELECT * FROM pos_shifts WHERE id = $1 AND tenant_id = $2 AND user_id = $3`,
      [shift_id, tenantId, userId]
    );
    const shift = shiftRes.rows[0];

    if (!shift) {
      return res.status(404).json({ success: false, message: 'Shift not found' });
    }

    // 2️⃣ Fetch all sales for this shift
    const salesRes = await db.query(
      `SELECT ps.id, ps.product_id, ps.qty, ps.selling_price, ps.commission, ps.created_at, p.name as product_name
       FROM pos_sales ps
       JOIN products p ON ps.product_id = p.id
       WHERE ps.shift_id = $1 AND ps.tenant_id = $2 AND ps.user_id = $3
       ORDER BY ps.created_at ASC`,
      [shift_id, tenantId, userId]
    );

    const total_units = salesRes.rows.reduce((sum, s) => sum + Number(s.qty), 0);
    const total_sales = salesRes.rows.reduce((sum, s) => sum + Number(s.selling_price) * Number(s.qty), 0);

    // 3️⃣ Update the shift to mark it closed
    const updatedShift = await db.query(
      `UPDATE pos_shifts
       SET closed_at = now(), total_units = $1, total_sales = $2
       WHERE id = $3
       RETURNING *`,
      [total_units, total_sales, shift_id]
    );

    res.json({
      success: true,
      shift: updatedShift.rows[0],
      sales: salesRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to close shift' });
  }
}


// Open Shift
async function openShift(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;

  try {
    // Check if user already has an open shift
    const existingShift = await db.query(
      `SELECT * FROM pos_shifts
       WHERE tenant_id = $1 AND user_id = $2 AND closed_at IS NULL`,
      [tenantId, userId]
    );

    if (existingShift.rows.length > 0) {
      // Return the currently open shift
      return res.json({ success: true, shift: existingShift.rows[0] });
    }

    // Create a new shift
    const shiftRes = await db.query(
      `INSERT INTO pos_shifts (tenant_id, user_id, opened_at)
       VALUES ($1, $2, now()) RETURNING *`,
      [tenantId, userId]
    );

    res.json({ success: true, shift: shiftRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to open shift' });
  }
}


module.exports = { recordSale, closeShift, openShift };
