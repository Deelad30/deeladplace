const db = require("../config/database");

/**
 * PRODUCT PROFITABILITY
 * (Selling Price - Cost Price) × Quantity Sold
 */
exports.getProductProfitability = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { startDate, endDate, productId, categoryId, vendorId } = req.query;

    let filters = [`ps.tenant_id = $1`];
    let values = [tenantId];
    let idx = 2;

    if (startDate && endDate) {
      filters.push(`ps.created_at BETWEEN $${idx++} AND $${idx++}`);
      values.push(startDate, endDate);
    }

    if (productId) {
      filters.push(`ps.product_id = $${idx++}`);
      values.push(productId);
    }

    if (categoryId) {
      filters.push(`p.category_id = $${idx++}`);
      values.push(categoryId);
    }

    if (vendorId) {
      filters.push(`p.vendor_id = $${idx++}`);
      values.push(vendorId);
    }

    const sql = `
      SELECT
        ps.product_id,
        p.name AS product_name,
        SUM(ps.qty) AS total_qty,
        SUM(ps.qty * ps.selling_price) AS total_sales,
        sc_latest.tcop AS cost_per_unit,
        SUM(ps.qty * sc_latest.tcop) AS total_cost,
        SUM(ps.qty * ps.selling_price) - SUM(ps.qty * sc_latest.tcop) AS gross_profit
      FROM pos_sales ps
      JOIN products p ON p.id = ps.product_id
      LEFT JOIN LATERAL (
        SELECT sc.tcop
        FROM standard_costs sc
        WHERE sc.product_id = p.id
          AND sc.tenant_id = ps.tenant_id
        ORDER BY sc.created_at DESC
        LIMIT 1
      ) sc_latest ON true
      WHERE ${filters.join(" AND ")}
      GROUP BY ps.product_id, p.name, sc_latest.tcop
      ORDER BY gross_profit DESC;
    `;

    const { rows } = await db.query(sql, values);
    res.json({ ok: true, items: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * NET PROFIT
 * Total Sales - Total Expenses
 */
exports.getNetProfit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { startDate, endDate } = req.query;

    let salesFilter = [`tenant_id = $1`];
    let expenseFilter = [`tenant_id = $1`];
    let values = [tenantId];
    let idx = 2;

    if (startDate && endDate) {
      salesFilter.push(`created_at BETWEEN $${idx} AND $${idx + 1}`);
      expenseFilter.push(`expense_date BETWEEN $${idx} AND $${idx + 1}`);
      values.push(startDate, endDate);
      idx += 2;
    }

    const sql = `
      WITH sales AS (
        SELECT COALESCE(SUM(qty * selling_price), 0) AS total_sales
        FROM pos_sales
        WHERE ${salesFilter.join(" AND ")}
      ),
      expenses AS (
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE ${expenseFilter.join(" AND ")}
      )
      SELECT
        s.total_sales,
        e.total_expenses,
        (s.total_sales - e.total_expenses) AS net_profit
      FROM sales s, expenses e;
    `;

    const { rows } = await db.query(sql, values);
    res.json({ ok: true, summary: rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
