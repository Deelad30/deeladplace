const db = require('../config/database');
const stockService = require('../services/stock.service');
const logger = require('../utils/logger');

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
    cost_per_unit = null,
    source = null,
    destination = null,
    notes = null
  } = req.body;

  if (!item_type || !item_id || !movement_type || qty === undefined) {
    return res.status(400).json({
      success: false,
      message: 'item_type, item_id, movement_type, qty are required'
    });
  }

  try {
    const movement = await stockService.recordStockMovement({
      tenantId,
      itemType: item_type,
      itemId: item_id,
      qty,
      movementType: movement_type,
      costPerUnit: cost_per_unit,
      vendorId: vendor_id,
      reference,
      createdBy: userId,
      source,
      destination,
      notes
    });
    const inboundTypes = ['in', 'vendor_delivery', 'purchase', 'inbound'];
    const delta = inboundTypes.includes(movement_type) ? Number(qty) : -Number(qty);

    const stock = await stockService.upsertStockBalance(
      tenantId,
      item_type,
      item_id,
      delta,
      cost_per_unit !== null ? cost_per_unit : undefined
    );

    (async () => {
        try {
            if (item_type === 'material') {
                const itemRes = await db.query('SELECT name, min_stock_level, measurement_unit FROM raw_materials WHERE id = $1', [item_id]);
                const item = itemRes.rows[0];
                
                if (item && Number(stock.qty) <= Number(item.min_stock_level)) {
                     // Fetch user email (Assuming current user is admin/notifiable, or fetch tenant owner)
                     // For now, let's send to the current user as a confirmation/alert
                     const userRes = await db.query('SELECT email, name FROM users WHERE id = $1', [userId]);
                     const user = userRes.rows[0];
                     
                     if (user && user.email) {
                         const emailService = require('../utils/emailService');
                         await emailService.sendLowStockAlert(
                             user, 
                             { name: item.name, unit: item.measurement_unit }, 
                             Number(stock.qty), 
                             Number(item.min_stock_level)
                         );
                         logger.info('Low stock email sent', { item: item.name, email: user.email });
                     }
                }
            }
        } catch (emailErr) {
            logger.error('Failed to send low stock alert', { error: emailErr.message });
        }
    })();
    res.json({ success: true, movement, stock });

  } catch (err) {
    logger.error('Failed to create stock movement', { error: err.message, tenantId, userId });
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
    logger.error('Failed to issue materials to production', { error: err.message, tenantId, userId });
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
    const recipeRes = await db.query(
      `SELECT COUNT(*) AS cnt FROM recipes WHERE tenant_id = $1 AND product_id = $2`,
      [tenantId, product_id]
    );

    if (Number(recipeRes.rows[0].cnt) === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record production: Product has no recipe defined'
      });
    }
    const costRes = await db.query(
      `SELECT TCOP FROM standard_costs 
       WHERE tenant_id = $1 AND product_id = $2
       ORDER BY id DESC LIMIT 1`,
      [tenantId, product_id]
    );

    const cost_per_unit = costRes.rows[0] ? Number(costRes.rows[0].tcop) : 0;
    const total_cost = cost_per_unit * qty;

    const vendorRes = await db.query(
      `SELECT vendor_id FROM products WHERE id = $1 AND tenant_id = $2`,
      [product_id, tenantId]
    );

    const vendor_id = vendorRes.rows[0] ? vendorRes.rows[0].vendor_id : null;

    const movementRes = await db.query(
      `INSERT INTO stock_movements 
       (tenant_id, item_type, item_id, movement_type, qty, cost_per_unit, total_cost, vendor_id, created_by)
       VALUES ($1, 'product', $2, 'production_in', $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, product_id, qty, cost_per_unit, total_cost, vendor_id, userId]
    );

    const stock = await stockService.upsertStockBalance(tenantId, 'product', product_id, qty, cost_per_unit);

    res.json({
      success: true,
      movement: movementRes.rows[0],
      stock
    });

  } catch (err) {
    logger.error('Failed to record production', { error: err.message, tenantId, userId, product_id });
    res.status(500).json({ success: false, message: 'Failed to record production' });
  }
}







async function getLedger(req, res) {
  const tenantId = req.user.tenant_id;
  
  try {
    const query = `
      SELECT 
        sm.*,
        COALESCE(rm.name, p.name) as item_name,
        COALESCE(rm.measurement_unit, 'unit') as measurement_unit,
        u.name as created_by_name
      FROM stock_movements sm
      LEFT JOIN raw_materials rm ON sm.item_id = rm.id AND sm.item_type = 'material'
      LEFT JOIN products p ON sm.item_id = p.id AND sm.item_type = 'product'
      LEFT JOIN users u ON sm.created_by = u.id
      WHERE sm.tenant_id = $1
        AND sm.movement_type IN ('in', 'out', 'waste')
      ORDER BY sm.created_at DESC
      LIMIT 100
    `;
    
    const result = await db.query(query, [tenantId]);
    res.json({ success: true, movements: result.rows });
  } catch (err) {
    logger.error('Failed to fetch ledger', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch ledger' });
  }
}

async function getStockBalance(req, res) {
  const tenantId = req.user.tenant_id;
  
  try {
    const query = `
      SELECT 
        rm.id,
        rm.name,
        rm.measurement_unit,
        rm.min_stock_level,
        COALESCE(sb.qty, 0) as current_stock,
        COALESCE(sb.average_cost, 0) as average_cost,
        sb.updated_at
      FROM raw_materials rm
      LEFT JOIN stock_balance sb 
        ON rm.id = sb.item_id 
        AND sb.item_type = 'material' 
        AND sb.tenant_id = rm.tenant_id
      WHERE rm.tenant_id = $1
      ORDER BY rm.name ASC
    `;
    
    const result = await db.query(query, [tenantId]);
    
    const stockItems = result.rows.map(item => ({
      ...item,
      is_low_stock: Number(item.current_stock) <= Number(item.min_stock_level || 0)
    }));

    res.json({ success: true, stock: stockItems });
  } catch (err) {
    logger.error('Failed to fetch stock balance', { error: err.message, tenantId });
    res.status(500).json({ success: false, message: 'Failed to fetch stock balance' });
  }
}

module.exports = { createMovement, issueToProduction, recordProduction, getLedger, getStockBalance };