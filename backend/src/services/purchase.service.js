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

  return { ...purchase };
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

  // If material ID or qty changed, we just update the record. 
  // No stock balance logic needed here anymore.


  const updateRes = await db.query(
    `UPDATE material_purchases
     SET material_id=$1,
         purchase_qty=$2,
         purchase_price=$3,
         vendor_id=$4,
         purchase_date=$5,
         measurement_unit=$6
     WHERE id=$7 AND tenant_id=$8
     RETURNING *`,
    [material_id, purchase_qty, purchase_price, vendor_id, purchase_date, measurement_unit, purchaseId, tenantId]
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

    // No stock reversal needed anymore.


    // 4. Delete the purchase record
    await client.query(
      `DELETE FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
      [purchaseId, tenantId]
    );

    await client.query('COMMIT');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
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
