// src/controllers/material.controller.js
const db = require('../config/database');

async function createMaterial(req, res) {
  const tenantId = req.user.tenant_id;
  const { name, measurement_unit } = req.body;

  if (!name || !measurement_unit) {
    return res.status(400).json({ error: 'name and measurement_unit are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO raw_materials (tenant_id, name, measurement_unit)
       VALUES ($1, $2, $3) RETURNING *`,
      [tenantId, name, measurement_unit]
    );

    res.json({ ok: true, material: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create material failed' });
  }
}

async function getMaterials(req, res) {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT * FROM raw_materials WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );
    res.json({ ok: true, materials: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch materials failed' });
  }
}

async function updateMaterial(req, res) {
  const tenantId = req.user.tenant_id;
  const id = Number(req.params.id);
  const { name, measurement_unit } = req.body;

  try {
    const result = await db.query(
      `UPDATE raw_materials
       SET name = $1, measurement_unit = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [name, measurement_unit, id, tenantId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Material not found' });

    res.json({ ok: true, material: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update material failed' });
  }
}

async function deleteMaterial(req, res) {
  const tenantId = req.user.tenant_id;
  const id = Number(req.params.id);

  try {
    const result = await db.query(
      `DELETE FROM raw_materials WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [id, tenantId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Material not found' });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete material failed' });
  }
}

module.exports = {
  createMaterial,
  getMaterials,
  updateMaterial,
  deleteMaterial
};
