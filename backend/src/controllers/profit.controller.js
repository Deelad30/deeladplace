const db = require("../config/database");

exports.getProfitReport = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const sql = `
      SELECT
          ps.product_id,
          p.name AS product_name,

          SUM(ps.qty) AS total_qty,
          SUM(ps.qty * ps.selling_price) AS revenue,

          sc.tcop AS cost_per_unit,
          SUM(ps.qty * sc.tcop) AS cogs_total,

          SUM(ps.qty * ps.selling_price) - SUM(ps.qty * sc.tcop) AS gross_profit
      FROM pos_sales ps
      JOIN products p 
          ON p.id = ps.product_id
      LEFT JOIN standard_costs sc
          ON sc.product_id = p.id AND sc.tenant_id = ps.tenant_id
      WHERE ps.tenant_id = $1
      GROUP BY ps.product_id, p.name, sc.tcop;
    `;

    const result = await db.query(sql, [tenantId]);
    return res.json({ ok: true, items: result.rows });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

