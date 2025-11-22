const RawMaterial = require('../models/RawMaterial');

// CREATE
exports.createRawMaterial = async (req, res) => {
  try {
    const { name, unit, current_cost } = req.body;
    const material = await RawMaterial.create({ name, unit, current_cost });
    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// GET ALL
exports.getRawMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.getAll();
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
exports.getRawMaterial = async (req, res) => {
  try {
    const material = await RawMaterial.getById(req.params.id);
    res.json(material);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Raw material not found' });
  }
};

// UPDATE
exports.updateRawMaterial = async (req, res) => {
  try {
    const updated = await RawMaterial.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE
exports.deleteRawMaterial = async (req, res) => {
  try {
    await RawMaterial.delete(req.params.id);
    res.json({ message: 'Raw material deleted' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
