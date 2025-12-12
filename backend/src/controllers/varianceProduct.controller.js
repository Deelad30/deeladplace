// controllers/varianceProduct.controller.js
const db = require("../config/database");

exports.getProductVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { start_date, end_date } = req.query;

    const dateFilter = start_date && end_date
      ? `AND sp.date BETWEEN '${start_date}' AND '${end_date}'`
      : "";

    const sql = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,

        -- EXPECTED qty from SIC
        COALESCE(SUM(sp.expected_sales), 0) AS expected_sales_qty,

        -- SYSTEM qty from POS sales
        COALESCE(SUM(ps.qty), 0) AS actual_sales_qty,

        -- Selling price (avg)
        COALESCE(AVG(ps.selling_price), 0) AS selling_price,

        -- Standard cost (TCOP)
        COALESCE((
            SELECT tcop FROM standard_costs sc
            WHERE sc.product_id = p.id AND sc.tenant_id = $1
            ORDER BY id DESC LIMIT 1
        ), 0) AS tcop
      FROM products p
      LEFT JOIN sic_products sp
        ON sp.product_id = p.id AND sp.tenant_id = $1 ${dateFilter}
      LEFT JOIN pos_sales ps
        ON ps.product_id = p.id AND ps.tenant_id = $1
        ${start_date && end_date ? `AND DATE(ps.created_at) BETWEEN '${start_date}' AND '${end_date}'` : ""}
      WHERE p.tenant_id = $1
      GROUP BY p.id, p.name;
    `;

    const result = await db.query(sql, [tenantId]);

    const items = result.rows.map(r => {
      const expectedQty = Number(r.expected_sales_qty);
      const actualQty = Number(r.actual_sales_qty);
      const varianceQty = actualQty - expectedQty;

      const sellingPrice = Number(r.selling_price);
      const tcop = Number(r.tcop);

      const expectedRevenue = expectedQty * sellingPrice;
      const actualRevenue = actualQty * sellingPrice;
      const revenueVariance = actualRevenue - expectedRevenue;

      const expectedCOGS = expectedQty * tcop;
      const actualCOGS = actualQty * tcop;
      const cogsVariance = actualCOGS - expectedCOGS;

      const profitVariance = revenueVariance - cogsVariance;

      let remark = "Good";
      if (revenueVariance < 0) remark = "Missing sales";     // negative variance = missing
      else if (revenueVariance > 0) remark = "Overring";    // positive variance = overring


      return {
        product_id: r.product_id,
        product_name: r.product_name,

        expected_sales_qty: expectedQty,
        actual_sales_qty: actualQty,
        variance_qty: varianceQty,

        selling_price: sellingPrice,
        tcop: tcop,

        expected_revenue: expectedRevenue,
        actual_revenue: actualRevenue,
        revenue_variance: revenueVariance,

        expected_cogs: expectedCOGS,
        actual_cogs: actualCOGS,
        cogs_variance: cogsVariance,

        profit_variance: profitVariance,

        remark
      };
    });

    return res.json({ ok: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
