// inventory.controller.js
const db = require('../config/database');
const stockService = require('../services/stock.service');

async function createMovement(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;
  const { item_type, item_id, movement_type, qty, vendor_id, reference, cost_per_unit } = req.body;

  if (!item_type || !item_id || !movement_type || qty === undefined) {
    return res.status(400).json({ success: false, message: 'item_type,item_id,movement_type,qty required' });
  }

  const total_cost = cost_per_unit ? Number(cost_per_unit) * Number(qty) : null;

  try {
    const result = await db.query(
      `INSERT INTO stock_movements
       (tenant_id, item_type, item_id, movement_type, qty, vendor_id, reference, cost_per_unit, total_cost, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [tenantId, item_type, item_id, movement_type, qty, vendor_id || null, reference || null, cost_per_unit || null, total_cost || null, req.user.userId || req.user.userId]
    );

    // Update stock balance: inbound = qty positive, outbound = negative
    const delta = (movement_type === 'in' || movement_type === 'vendor_delivery') ? Number(qty) : -Number(qty);

    const stock = await stockService.upsertStockBalance(tenantId, item_type, item_id, delta, cost_per_unit === null ? undefined : cost_per_unit);

    res.json({ success: true, movement: result.rows[0], stock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create stock movement' });
  }
}

module.exports = { createMovement };
