// stock.service.js
const db = require('../config/database');

async function upsertStockBalance(tenantId, itemType, itemId, deltaQty, costPerUnit = null) {
  // upsert: update qty and weighted average cost
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const cur = await client.query(
      `SELECT qty, average_cost FROM stock_balance
       WHERE tenant_id = $1 AND item_type = $2 AND item_id = $3 FOR UPDATE`,
      [tenantId, itemType, itemId]
    );

    if (cur.rows.length === 0) {
      // new row
      const initialQty = Number(deltaQty);
      const avgCost = costPerUnit ? Number(costPerUnit) : 0;
      await client.query(
        `INSERT INTO stock_balance (tenant_id, item_type, item_id, qty, average_cost)
         VALUES ($1,$2,$3,$4,$5)`,
        [tenantId, itemType, itemId, initialQty, avgCost]
      );
      await client.query('COMMIT');
      return { qty: initialQty, average_cost: avgCost };
    }

    const existing = cur.rows[0];
    const oldQty = Number(existing.qty);
    const oldAvg = Number(existing.average_cost || 0);
    const newQty = oldQty + Number(deltaQty);

    let newAvg = oldAvg;
    // If inbound (deltaQty > 0) and costPerUnit provided, compute weighted average
    if (Number(deltaQty) > 0 && costPerUnit !== null) {
      const inboundCost = Number(costPerUnit) * Number(deltaQty);
      const totalCost = oldAvg * oldQty + inboundCost;
      newAvg = newQty > 0 ? totalCost / newQty : 0;
    }

    // if outbound and newQty < 0, allow negative (prevent earlier by validations) but keep avg
    await client.query(
      `UPDATE stock_balance SET qty = $1, average_cost = $2, updated_at = now()
       WHERE tenant_id = $3 AND item_type = $4 AND item_id = $5`,
      [newQty, newAvg, tenantId, itemType, itemId]
    );

    await client.query('COMMIT');
    return { qty: newQty, average_cost: newAvg };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { upsertStockBalance };
