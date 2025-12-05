const materialService = require('../services/material.service');

 async function getMaterials (req, res) {  
  try {
    const tenantId = req.user.tenant_id;
    const items = await materialService.listMaterials(tenantId);

    res.json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

async function createMaterial (req, res) {
  try {
    const tenantId = req.user.tenant_id;
    const newMat = await materialService.createMaterial(tenantId, req.body);
    res.json({ ok: true, material: newMat });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

async function updateMaterial (req, res) {
  try {
    const tenantId = req.user.tenant_id;
    const materialId = req.params.id;
    const updated = await materialService.updateMaterial(materialId, tenantId, req.body);
    res.json({ ok: true, material: updated });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

async function deleteMaterial (req, res) {
  try {
    const tenantId = req.user.tenant_id;
    const materialId = req.params.id;
    await materialService.deleteMaterial(materialId, tenantId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

module.exports = { createMaterial, getMaterials, updateMaterial, deleteMaterial };