// inventory.controller.js
const db = require('../config/database');
const stockService = require('../services/stock.service');

async function createMovement(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;
  const {
    item_type,
    item_id,
    movement_type,
    qty,
    vendor_id = null,
    reference = null,
    cost_per_unit = null
  } = req.body;

  // ✅ Validate required fields
  if (!item_type || !item_id || !movement_type || qty === undefined) {
    return res.status(400).json({
      success: false,
      message: 'item_type, item_id, movement_type, qty are required'
    });
  }

  try {
    // 1️⃣ Record the stock movement
    const movement = await stockService.recordStockMovement({
      tenantId,
      itemType: item_type,
      itemId: item_id,
      qty,
      movementType: movement_type,
      costPerUnit: cost_per_unit,
      vendorId: vendor_id,
      reference,
      createdBy: userId
    });

    // 2️⃣ Determine stock delta: inbound positive, outbound negative
    const inboundTypes = ['in', 'vendor_delivery', 'purchase'];
    const delta = inboundTypes.includes(movement_type) ? Number(qty) : -Number(qty);

    // 3️⃣ Update stock balance
    const stock = await stockService.upsertStockBalance(
      tenantId,
      item_type,
      item_id,
      delta,
      cost_per_unit !== null ? cost_per_unit : undefined
    );

    // 4️⃣ Return full info
    res.json({ success: true, movement, stock });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create stock movement' });
  }
}

async function issueToProduction(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;
  const { items, reference } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Items array is required' });
  }

  try {
    const results = [];

    for (const item of items) {
      const { item_id, item_type = 'material', qty, cost_per_unit = null } = item;

      if (!item_id || qty === undefined) {
        return res.status(400).json({ success: false, message: 'item_id and qty required for each item' });
      }

      // 1️⃣ Record stock movement (outbound)
      const movement = await stockService.recordStockMovement({
        tenantId,
        itemType: item_type,
        itemId: item_id,
        qty,
        movementType: 'issue', // outbound to production
        costPerUnit: cost_per_unit,
        reference,
        createdBy: userId
      });

      // 2️⃣ Update stock balance
      const stock = await stockService.upsertStockBalance(
        tenantId,
        item_type,
        item_id,
        -qty, // subtract qty from stock
        cost_per_unit !== null ? cost_per_unit : undefined
      );

      results.push({ movement, stock });
    }

    res.json({ success: true, items: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to issue raw materials to production' });
  }
}

async function recordProduction(req, res) {
  const tenantId = req.user.tenant_id;
  const userId = req.user.userId || req.user.id;
  const { product_id, qty, reference } = req.body;

  if (!product_id || !qty) {
    return res.status(400).json({ success: false, message: 'product_id and qty are required' });
  }

  try {
    // Check if product has a recipe
    const recipeRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM recipes WHERE tenant_id = $1 AND product_id = $2`,
      [tenantId, product_id]
    );

    if (Number(recipeRes.rows[0].cnt) === 0) {
      return res.status(400).json({ success: false, message: 'Cannot record production: Product has no recipe defined' });
    }

    // Fetch latest standard cost (TCOP) for this product
    const costRes = await db.query(
      `SELECT TCOP FROM standard_costs 
       WHERE tenant_id = $1 AND product_id = $2
       ORDER BY id DESC LIMIT 1`,
      [tenantId, product_id]
    );

    const cost_per_unit = costRes.rows[0] ? Number(costRes.rows[0].tcop) : 0;
    const total_cost = cost_per_unit * qty;     

    // Record production
    const movementRes = await db.query(
      `INSERT INTO stock_movements 
       (tenant_id, item_type, item_id, movement_type, qty, cost_per_unit, total_cost, created_by)
       VALUES ($1, 'product', $2, 'production_in', $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, product_id, qty, cost_per_unit, total_cost, userId]
    );

    res.json({ success: true, movement: movementRes.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record production' });
  }
}




module.exports = { createMovement, issueToProduction, recordProduction };