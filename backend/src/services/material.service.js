const db = require('../config/database');
const SQL = require('../utils/sql');

async function listMaterials(tenantId) {
  const res = await db.query(SQL.LIST_ITEMS, [tenantId]);
  return res.rows;
}

async function createMaterial(tenantId, data) {
  const { name, measurement_unit } = data;
  const res = await db.query(SQL.CREATE_MATERIAL, [
    tenantId,
    name,
    measurement_unit
  ]);
  return res.rows[0];
}

async function updateMaterial(materialId, tenantId, data) {
  const { name, measurement_unit } = data;
  const res = await db.query(SQL.UPDATE_MATERIAL, [
    materialId,
    name,
    measurement_unit,
    tenantId
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
