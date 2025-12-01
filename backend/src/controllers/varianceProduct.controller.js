const db = require("../config/database");

exports.getProductVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const sql = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,

        COALESCE(SUM(sp.computed_sales_qty), 0) AS expected_sales_qty,

        COALESCE(SUM(ps.qty), 0) AS actual_sales_qty,

        COALESCE(AVG(ps.selling_price), 0) AS selling_price
      FROM products p
      LEFT JOIN sic_products sp 
          ON sp.product_id = p.id AND sp.tenant_id = $1
      LEFT JOIN pos_sales ps
          ON ps.product_id = p.id AND ps.tenant_id = $1
      WHERE p.tenant_id = $1
      GROUP BY p.id, p.name;
    `;

    const result = await db.query(sql, [tenantId]);
    const rows = result.rows;

    const items = rows.map(r => {
      const expectedAmount = r.expected_sales_qty * r.selling_price;
      const actualAmount   = r.actual_sales_qty * r.selling_price;

      return {
        product_id: r.product_id,
        product_name: r.product_name,
        expected_sales_qty: Number(r.expected_sales_qty),
        actual_sales_qty: Number(r.actual_sales_qty),
        selling_price: Number(r.selling_price),
        expected_sales_amount: expectedAmount,
        actual_sales_amount: actualAmount,
        variance_amount: actualAmount - expectedAmount
      };
    });

    return res.json({ ok: true, items });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
