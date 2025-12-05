const db = require('../config/database');
const SQL = require('../utils/sql');
const { recordStockMovement } = require('./stock.service');

async function listPurchases(tenantId) {
  const res = await db.query(SQL.LIST_PURCHASES, [tenantId]);
  return res.rows;
}

async function createPurchase(tenantId, data) {
  const {
    material_id,
    purchase_price,
    purchase_qty,
    vendor_id,
    purchase_date,
    measurement_unit
  } = data;

  const res = await db.query(SQL.CREATE_PURCHASE, [
    tenantId,
    material_id,
    purchase_price,
    purchase_qty,
    vendor_id,
    purchase_date,
    measurement_unit
  ]);

  // record stock in
  const unitCost = Number(purchase_price) / Number(purchase_qty);
  await recordStockMovement({
    tenantId,
    itemId: material_id,
    qty: purchase_qty,
    costPerUnit: unitCost,
    movementType: 'in'
  });

  return res.rows[0];
}

module.exports = {
  listPurchases,
  createPurchase
};
