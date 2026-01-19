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
    measurement_unit
  } = data;

  // 1️⃣ Handle dynamic material creation if material_id is missing but name is provided
  if (!material_id && material_name) {
    // Check if material already exists (case-insensitive)
    const existingRes = await db.query(SQL.GET_MATERIAL_BY_NAME, [material_name, tenantId]);
    
    if (existingRes.rows.length > 0) {
      material_id = existingRes.rows[0].id;
    } else {
      // Create new raw material
      const newMatRes = await db.query(SQL.CREATE_MATERIAL, [tenantId, material_name, measurement_unit || 'pcs']);
      material_id = newMatRes.rows[0].id;
    }
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
    purchase_date
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
  const purchaseRes = await db.query(
    `SELECT * FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
    [purchaseId, tenantId]
  );

  if (!purchaseRes.rows.length) {
    const err = new Error('Purchase not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const purchase = purchaseRes.rows[0];
  const usageRes = await db.query(
    `SELECT COALESCE(SUM(qty), 0) AS used_qty 
     FROM stock_movements 
     WHERE reference = $1 AND tenant_id = $2`,
    [purchaseId, tenantId]
  );

  const usedQty = Number(usageRes.rows[0]?.used_qty || 0);
  if (usedQty > 0) {
    const err = new Error('Purchase already used and cannot be deleted');
    err.code = 'PURCHASE_USED';
    throw err;
  }

  await recordStockMovement({
    tenantId,
    itemId: purchase.material_id,
    qty: -purchase.purchase_qty, // negative because we remove stock
    costPerUnit: purchase.purchase_price / purchase.purchase_qty,
    movementType: 'out',
    reference: purchase.id,
    createdBy: userId
  });

  await upsertStockBalance(
    tenantId,
    'material',
    purchase.material_id,
    -purchase.purchase_qty
  );

  await db.query(
    `DELETE FROM material_purchases WHERE id = $1 AND tenant_id = $2`,
    [purchaseId, tenantId]
  );
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
