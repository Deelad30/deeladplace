const db = require('../config/database');
const logger = require('../utils/logger');

exports.addProductLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { product_id, labour_id, amount } = req.body;

  if (!product_id || !labour_id || amount === undefined) {
    return res.status(400).json({ success: false, message: "product_id, labour_id and amount are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO product_labour (tenant_id, product_id, labour_id, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tenantId, product_id, labour_id, amount]
    );

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    logger.error('Failed to map labour to product', { error: err.message, tenantId, productId: product_id });
    return res.status(500).json({ success: false, message: "Failed to map labour to product" });
  }
};

exports.getProductLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const productId = req.params.productId;

  try {
    const result = await db.query(
      `SELECT pl.*, l.name AS labour_name
       FROM product_labour pl
       JOIN labour_costs l ON l.id = pl.labour_id
       WHERE pl.tenant_id = $1 AND pl.product_id = $2`,
      [tenantId, productId]
    );

    return res.json({ success: true, labour: result.rows });
  } catch (err) {
    logger.error('Failed to fetch product labour', { error: err.message, tenantId, productId });
    return res.status(500).json({ success: false, message: "Failed to fetch product labour" });
  }
};

exports.updateLabourMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;
  const { labour_id, amount } = req.body;

  if (!labour_id || amount === undefined) {
    return res.status(400).json({ success: false, message: "labour_id and amount required" });
  }

  try {
    const result = await db.query(
      `UPDATE product_labour
       SET labour_id = $1, amount = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [labour_id, amount, mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    logger.error('Failed to update labour mapping', { error: err.message, tenantId, mappingId });
    return res.status(500).json({ success: false, message: "Failed to update labour mapping" });
  }
};

exports.deleteLabourMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM product_labour
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, message: "Labour mapping deleted" });
  } catch (err) {
    logger.error('Failed to delete labour mapping', { error: err.message, tenantId, mappingId });
    return res.status(500).json({ success: false, message: "Failed to delete labour mapping" });
  }
};
