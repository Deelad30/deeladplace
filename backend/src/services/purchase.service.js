const db = require('../config/database');
const SQL = require('../utils/sql');
const { recordStockMovement, upsertStockBalance } = require('./stock.service');

async function listPurchases(tenantId) {
  const res = await db.query(SQL.LIST_PURCHASES, [tenantId]);
  return res.rows;
}

async function createPurchase(tenantId, data, userId = null) {
  let {
    material_id,
    material_name,
    purchase_price,
    purchase_qty,
    vendor_id,
    purchase_date,
    measurement_unit,
    min_stock_level
  } = data;

  console.log('[DEBUG] createPurchase input:', { material_id, material_name, min_stock_level });

  // 1️⃣ Handle dynamic material creation if material_id is missing but name is provided
  if (!material_id && material_name) {
    // Check if material already exists (case-insensitive)
    const existingRes = await db.query(SQL.GET_MATERIAL_BY_NAME, [material_name, tenantId]);
    
    if (existingRes.rows.length > 0) {
      material_id = existingRes.rows[0].id;
      // Update existing material metadata if provided
      await db.query(`UPDATE raw_materials SET min_stock_level = $1, measurement_unit = COALESCE($2, measurement_unit) WHERE id = $3 AND tenant_id = $4`, [min_stock_level || 0, measurement_unit, material_id, tenantId]);
    } else {
      // Create new raw material
      const newMatRes = await db.query(SQL.CREATE_MATERIAL, [tenantId, material_name, measurement_unit || 'pcs', min_stock_level || 0]);
      material_id = newMatRes.rows[0].id;
    }
  } else if (material_id) {
        // If material ID is provided directly, also update metadata if provided
         await db.query(`UPDATE raw_materials SET min_stock_level = $1, measurement_unit = COALESCE($2, measurement_unit) WHERE id = $3 AND tenant_id = $4`, [min_stock_level || 0, measurement_unit, material_id, tenantId]);
  }

  if (!material_id) {
    throw new Error('Material ID or Name is required');
  }

  // 2️⃣ Insert purchase
  const res = await db.query(SQL.CREATE_PURCHASE, [
    tenantId,
    material_id,
    purchase_price,
    purchase_qty,
    vendor_id,
    purchase_date,
    measurement_unit
  ]);

  const purchase = res.rows[0];

  // 3️⃣ Compute unit cost
  const unitCost = Number(purchase_price) / Number(purchase_qty);

  // 4️⃣ Record stock movement with all metadata
  const movement = await recordStockMovement({
    tenantId,
    itemId: material_id,
    qty: purchase_qty,
    costPerUnit: unitCost,
    movementType: 'in',
    vendorId: vendor_id,
    reference: purchase.id,
    createdBy: userId
  });

  // 5️⃣ Update stock balance
  const stock = await upsertStockBalance(tenantId, 'material', material_id, purchase_qty, unitCost);

  return { ...purchase, movement, stock };
}

async function updatePurchase(tenantId, purchaseId, data, userId = null) {
  const {
    material_id,
    purchase_qty,
    purchase_price,
    vendor_id,
    purchase_date,
    measurement_unit,
    min_stock_level
  } = data;

  const res = await db.query(
    `SELECT * FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
    [purchaseId, tenantId]
  );

  if (!res.rows.length) {
    const err = new Error('Purchase not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const oldPurchase = res.rows[0];

  // Update material metadata if provided
  if (material_id) {
    await db.query(
      `UPDATE raw_materials 
       SET min_stock_level = $1, 
           measurement_unit = COALESCE($2, measurement_unit) 
       WHERE id = $3 AND tenant_id = $4`,
      [min_stock_level || 0, measurement_unit, material_id, tenantId]
    );
  }

  const usageRes = await db.query(
    `SELECT COALESCE(SUM(qty),0) AS used_qty 
     FROM stock_movements 
     WHERE reference=$1 AND tenant_id=$2`,
    [purchaseId, tenantId]
  );
  const usedQty = Number(usageRes.rows[0]?.used_qty || 0);

  if (purchase_qty < usedQty) {
    const err = new Error(`Cannot reduce quantity below already used amount (${usedQty})`);
    err.code = 'INVALID_QTY';
    throw err;
  }

  if (oldPurchase.material_id !== material_id || oldPurchase.purchase_qty !== purchase_qty) {
    // 3a️⃣ Reverse old stock
    const oldUnitCost = oldPurchase.purchase_price / oldPurchase.purchase_qty;
    await recordStockMovement({
      tenantId,
      itemId: oldPurchase.material_id,
      qty: -oldPurchase.purchase_qty,
      costPerUnit: oldUnitCost,
      movementType: 'out',
      reference: purchaseId,
      createdBy: userId
    });
    await upsertStockBalance(
      tenantId,
      'material',
      oldPurchase.material_id,
      -oldPurchase.purchase_qty
    );

  
    const newUnitCost = purchase_price / purchase_qty;
    await recordStockMovement({
      tenantId,
      itemId: material_id,
      qty: purchase_qty,
      costPerUnit: newUnitCost,
      movementType: 'in',
      reference: purchaseId,
      createdBy: userId
    });
    await upsertStockBalance(
      tenantId,
      'material',
      material_id,
      purchase_qty,
      newUnitCost
    );
  }

  const updateRes = await db.query(
    `UPDATE material_purchases
     SET material_id=$1,
         purchase_qty=$2,
         purchase_price=$3,
         vendor_id=$4,
         purchase_date=$5
     WHERE id=$6 AND tenant_id=$7
     RETURNING *`,
    [material_id, purchase_qty, purchase_price, vendor_id, purchase_date, purchaseId, tenantId]
  );

  return updateRes.rows[0];
}


async function deletePurchase(tenantId, purchaseId, userId = null) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get purchase details
    const purchaseRes = await client.query(
      `SELECT * FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
      [purchaseId, tenantId]
    );

    if (!purchaseRes.rows.length) {
      const err = new Error('Purchase not found');
      err.code = 'NOT_FOUND';
      throw err;
    }
    const purchase = purchaseRes.rows[0];

    // 2. Check if we have enough stock to remove this purchase
    const stockRes = await client.query(
      `SELECT qty FROM stock_balance 
       WHERE tenant_id = $1 AND item_type = 'material' AND item_id = $2`,
      [tenantId, purchase.material_id]
    );
    const currentStock = Number(stockRes.rows[0]?.qty || 0);
    const purchaseQty = Number(purchase.purchase_qty);

    if (currentStock < purchaseQty) {
      const err = new Error(`Cannot delete: Insufficient stock. You have used some of these items (Current: ${currentStock}, Purchase: ${purchaseQty})`);
      err.code = 'PURCHASE_USED';
      throw err;
    }

    // 3. Record stock OUT movement (correction)
    const unitCost = purchase.purchase_price / purchase.purchase_qty;
    
    // We can re-use recordStockMovement logic but we are in a transaction here.
    // For safety/simplicity, let's just insert the movement and update balance manually
    // or assume recordStockMovement handles its own connection? 
    // stock.service usually uses `db.query` which grabs a pool client. 
    // To be transaction-safe, we should pass the client, but `recordStockMovement` might not support it.
    // Given the architecture, let's just use the service calls after commit? 
    // No, we need atomicity. 
    // Ideally we should refactor stock.service to accept a client.
    // For now, let's do the update manually in this transaction to be safe.

    // 3a. Record movement
    await client.query(`
      INSERT INTO stock_movements
        (tenant_id, item_type, item_id, movement_type, qty, reference, created_by, cost_per_unit, total_cost, notes)
      VALUES
        ($1, 'material', $2, 'out', $3, $4, $5, $6, $7, $8)
    `, [
      tenantId, 
      purchase.material_id, 
      -purchaseQty, 
      purchase.id, 
      userId, 
      unitCost, 
      purchase.purchase_price, 
      'Void Purchase' // Note
    ]);

    // 3b. Update balance
    // In a weighted average system, removing a specific purchase is complex. 
    // We are removing `purchaseQty` and `purchaseTotalValue` from the pool.
    
    // Get current state again (locked)
    const balanceRes = await client.query(
        `SELECT qty, average_cost FROM stock_balance 
         WHERE tenant_id = $1 AND item_type = 'material' AND item_id = $2 FOR UPDATE`,
        [tenantId, purchase.material_id]
    );
    
    if (balanceRes.rows.length) {
        const oldQty = Number(balanceRes.rows[0].qty);
        const oldAvg = Number(balanceRes.rows[0].average_cost);
        const oldTotalValue = oldQty * oldAvg;
        
        const removeValue = Number(purchase.purchase_price);
        
        const newQty = oldQty - purchaseQty;
        // Avoid division by zero
        // If newQty is 0 (or close), cost is 0. 
        // If newQty > 0, (oldTotal - removeValue) / newQty
        let newAvg = 0;
        if (newQty > 0.001) {
            newAvg = (oldTotalValue - removeValue) / newQty;
            if (newAvg < 0) newAvg = 0; // Should not happen unless data messed up
        }

        await client.query(
            `UPDATE stock_balance SET qty = $1, average_cost = $2, updated_at = NOW() 
             WHERE tenant_id = $3 AND item_type = 'material' AND item_id = $4`,
            [newQty, newAvg, tenantId, purchase.material_id]
        );
    }

    // 4. Delete the purchase record
    await client.query(
      `DELETE FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
      [purchaseId, tenantId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}


async function getPurchaseUsage(tenantId, purchaseId) {
  const purchaseRes = await db.query(
    `SELECT * FROM material_purchases
     WHERE id=$1 AND tenant_id=$2`,
    [purchaseId, tenantId]
  );

  if (!purchaseRes.rows.length) return null;
  const purchase = purchaseRes.rows[0];

  const usageRes = await db.query(
    `SELECT COALESCE(SUM(qty),0) as used_qty
     FROM stock_movements
     WHERE reference=$1 AND tenant_id=$2`,
    [purchaseId, tenantId]
  );

  const usedQty = Number(usageRes.rows[0]?.used_qty || 0);

  return {
    ...purchase,
    used_qty: usedQty
  };
}



module.exports = {
    listPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase
};
