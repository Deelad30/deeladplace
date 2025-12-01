const db = require("../config/database");

exports.getSalesReport = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    // Read optional filters
    const { startDate, endDate } = req.query;

    const sql = `
      SELECT
        ps.id,
        ps.product_id,
        p.name AS product_name,
        ps.qty,
        ps.selling_price,
        ps.payment_method,
        ps.order_method,
        ps.vendor_id,
        ps.created_at
      FROM pos_sales ps
      JOIN products p ON p.id = ps.product_id
      WHERE ps.tenant_id = $1
        AND ($2::timestamptz IS NULL OR ps.created_at >= $2)
        AND ($3::timestamptz IS NULL OR ps.created_at <= $3)
      ORDER BY ps.created_at DESC
    `;

    const params = [
      tenantId,
      startDate || null,
      endDate || null
    ];

    const result = await db.query(sql, params);

    return res.json({ ok: true, items: result.rows });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};


