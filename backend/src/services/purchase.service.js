const db = require('../config/database');
const SQL = require('../utils/sql');
const { recordStockMovement, upsertStockBalance } = require('./stock.service');

async function listPurchases(tenantId) {
  const res = await db.query(SQL.LIST_PURCHASES, [tenantId]);
  return res.rows;
}

async function createPurchase(tenantId, data, userId = null) {
  const {
    material_id,
    purchase_price,
    purchase_qty,
    vendor_id,
    purchase_date,
    measurement_unit
  } = data;

  // 1️⃣ Insert purchase
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

  // 2️⃣ Compute unit cost
  const unitCost = Number(purchase_price) / Number(purchase_qty);

  // 3️⃣ Record stock movement with all metadata
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

  // 4️⃣ Update stock balance
  const stock = await upsertStockBalance(tenantId, 'material', material_id, purchase_qty, unitCost);

  return { ...purchase, movement, stock };
}

module.exports = {
  listPurchases,
  createPurchase
};
