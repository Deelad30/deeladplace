// controllers/varianceProduct.controller.js
const db = require("../config/database");
const logger = require('../utils/logger');

exports.getProductVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { start_date, end_date, vendor_id } = req.query;

    let filters = [`p.tenant_id = $1`];
    let posFilters = [`ps.tenant_id = $1`];
    let sicFilters = [`sp.tenant_id = $1` + (start_date && end_date ? ` AND sp.date BETWEEN '${start_date}' AND '${end_date}'` : "")];
    
    let values = [tenantId];
    let idx = 2;

    if (vendor_id) {
        filters.push(`p.vendor_id = $${idx++}`);
        values.push(vendor_id);
    }

    const sql = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.vendor_id AS vendor_id,

        -- EXPECTED qty from POS (recorded in SIC)
        COALESCE(SUM(sp.expected_sales), 0) AS expected_sales_qty,

        -- ACTUAL qty from Physical Count (recorded in SIC system_sales)
        COALESCE(SUM(sp.system_sales), 0) AS actual_sales_qty,

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
        ON sp.product_id = p.id AND ${sicFilters[0]}
      LEFT JOIN pos_sales ps
        ON ps.product_id = p.id AND ps.tenant_id = $1
        ${start_date && end_date ? `AND DATE(ps.created_at) BETWEEN '${start_date}' AND '${end_date}'` : ""}
      WHERE ${filters.join(" AND ")}
      GROUP BY p.id, p.name;
    `;

    const result = await db.query(sql, values);

    const items = result.rows.map(r => {
      const expectedQty = Number(r.expected_sales_qty);
      const actualQty = Number(r.actual_sales_qty);
      
      const sellingPrice = Number(r.selling_price);
      const tcop = Number(r.tcop);

      const expectedRevenue = expectedQty * sellingPrice;
      const actualRevenue = actualQty * sellingPrice;

      // Formula: variance_amount = expected - actual (Matching doc)
      // Negative = missing sales, Positive = overring
      const revenueVariance = expectedRevenue - actualRevenue;

      const varianceQty = expectedQty - actualQty;

      const expectedCOGS = expectedQty * tcop;
      const actualCOGS = actualQty * tcop;
      const cogsVariance = expectedCOGS - actualCOGS;

      const profitVariance = revenueVariance - cogsVariance;

      let remark = "Good";
      if (revenueVariance < 0) remark = "Missing sales";     
      else if (revenueVariance > 0) remark = "Overring";    


      return {
        product_id: r.product_id,
        product_name: r.product_name,
        vendor_id: r.vendor_id,

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
    logger.error('Failed to get product variance', { error: err.message, productId: req.query.productId });
    return res.status(500).json({ ok: false, error: err.message });
  }
};
