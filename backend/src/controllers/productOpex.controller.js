const db = require('../config/database');
const logger = require('../utils/logger');

exports.addProductOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { product_id, opex_id, amount } = req.body;

  if (!product_id || !opex_id || amount === undefined) {
    return res.status(400).json({ success: false, message: "product_id, opex_id and amount are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO product_opex (tenant_id, product_id, opex_id, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tenantId, product_id, opex_id, amount]
    );

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    logger.error('Failed to map opex to product', { error: err.message, tenantId, productId: product_id });
    return res.status(500).json({ success: false, message: "Failed to map opex to product" });
  }
};

exports.getProductOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const productId = req.params.productId;

  try {
    const result = await db.query(
      `SELECT po.*, o.name AS opex_name
       FROM product_opex po
       JOIN opex_items o ON o.id = po.opex_id
       WHERE po.tenant_id = $1 AND po.product_id = $2`,
      [tenantId, productId]
    );

    return res.json({ success: true, opex: result.rows });
  } catch (err) {
    logger.error('Failed to fetch product opex', { error: err.message, tenantId, productId });
    return res.status(500).json({ success: false, message: "Failed to fetch product opex" });
  }
};

exports.updateOpexMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;
  const { opex_id, amount } = req.body;

  if (!opex_id || amount === undefined) {
    return res.status(400).json({ success: false, message: "opex_id and amount required" });
  }

  try {
    const result = await db.query(
      `UPDATE product_opex
       SET opex_id = $1, amount = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [opex_id, amount, mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    logger.error('Failed to update opex mapping', { error: err.message, tenantId, mappingId });
    return res.status(500).json({ success: false, message: "Failed to update opex mapping" });
  }
};

exports.deleteOpexMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM product_opex
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, message: "Opex mapping deleted" });
  } catch (err) {
    logger.error('Failed to delete opex mapping', { error: err.message, tenantId, mappingId });
    return res.status(500).json({ success: false, message: "Failed to delete opex mapping" });
  }
};
