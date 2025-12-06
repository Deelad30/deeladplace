const db =  require('../config/database');

exports.addPackagingToProduct = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { product_id, packaging_id, qty } = req.body;

  if (!product_id || !packaging_id || !qty) {
    return res.status(400).json({ success: false, message: "product_id, packaging_id and qty are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO product_packaging (tenant_id, product_id, packaging_id, qty)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tenantId, product_id, packaging_id, qty]
    );

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to map packaging to product" });
  }
};

exports.getProductPackaging = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const productId = req.params.productId;

  try {
    const result = await db.query(
      `SELECT * FROM product_packaging
       WHERE tenant_id = $1 AND product_id = $2`,
      [tenantId, productId]
    );

    return res.json({ success: true, packaging: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch product packaging" });
  }
};

exports.deletePackagingMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;

  try {
    const result = await db.query(
      `DELETE FROM product_packaging
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, message: "Packaging mapping deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete mapping" });
  }
};


exports.updatePackagingMapping = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const mappingId = req.params.id;
  const { packaging_id, qty } = req.body;

  if (!packaging_id || !qty) {
    return res.status(400).json({ success: false, message: "packaging_id and qty required" });
  }

  try {
    const result = await db.query(
      `UPDATE product_packaging
       SET packaging_id = $1, qty = $2
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [packaging_id, qty, mappingId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    return res.json({ success: true, mapping: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to update mapping" });
  }
};
