const db = require('../config/database');
const SQL = require('../utils/sql');

async function listMaterials(tenantId) {
  const res = await db.query(SQL.LIST_ITEMS, [tenantId]);
  return res.rows;
}

async function createMaterial(tenantId, data) {
  const { name, measurement_unit, min_stock_level } = data;
  const res = await db.query(SQL.CREATE_MATERIAL, [
    tenantId,
    name,
    measurement_unit,
    min_stock_level || 0
  ]);
  return res.rows[0];
}

async function updateMaterial(materialId, tenantId, data) {
  const { name, measurement_unit, min_stock_level } = data;
  console.log('[DEBUG] updateMaterial input:', { materialId, tenantId, min_stock_level });
  const res = await db.query(SQL.UPDATE_MATERIAL, [
    materialId,
    name,
    measurement_unit,
    tenantId,
    min_stock_level || 0
  ]);
  return res.rows[0];
}

async function deleteMaterial(materialId, tenantId) {
  return db.query(SQL.DELETE_MATERIAL, [materialId, tenantId]);
}

module.exports = {
  listMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
