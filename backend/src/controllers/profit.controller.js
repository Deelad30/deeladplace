const db = require("../config/database");
const logger = require('../utils/logger');

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

    if (startDate) {
      filters.push(`DATE(ps.created_at) >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      filters.push(`DATE(ps.created_at) <= $${idx++}`);
      values.push(endDate);
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
        COALESCE(sc_latest.tcop, 0) AS cost_per_unit,
        SUM(ps.qty * COALESCE(sc_latest.tcop, 0)) AS total_cost,
        SUM(ps.qty * ps.selling_price) - SUM(ps.qty * COALESCE(sc_latest.tcop, 0)) AS gross_profit
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
    logger.error("getProductProfitability error", { error: err.message, tenantId });
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

    if (startDate) {
      salesFilter.push(`DATE(created_at) >= $${idx}`);
      expenseFilter.push(`DATE(expense_date) >= $${idx}`);
      values.push(startDate);
      idx++;
    }
    if (endDate) {
      salesFilter.push(`DATE(created_at) <= $${idx}`);
      expenseFilter.push(`DATE(expense_date) <= $${idx}`);
      values.push(endDate);
      idx++;
    }

    const sql = `
      WITH product_profit AS (
        SELECT 
          COALESCE(SUM(ps.qty * ps.selling_price) - SUM(ps.qty * COALESCE(sc_latest.tcop, 0)), 0) AS total_product_profit,
          COALESCE(SUM(ps.qty * ps.selling_price), 0) AS total_sales
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
        WHERE ps.tenant_id = $1
          ${startDate ? `AND DATE(ps.created_at) >= $2` : ""}
          ${endDate ? `AND DATE(ps.created_at) <= ${startDate ? "$3" : "$2"}` : ""}
      ),
      expenses AS (
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE tenant_id = $1
          ${startDate ? `AND DATE(expense_date) >= $2` : ""}
          ${endDate ? `AND DATE(expense_date) <= ${startDate ? "$3" : "$2"}` : ""}
      )
      SELECT
        pp.total_sales,
        pp.total_product_profit,
        e.total_expenses,
        (pp.total_product_profit - e.total_expenses) AS net_profit
      FROM product_profit pp, expenses e;
    `;

    // Note: Net Profit is now Gross Profit - Expenses
    // This assumes "Expenses" are OPEX/Labour and don't include COGS already.
    // If expenses include COGS, this would double count. 
    // Usually, "Cumulative Net Profit" = Gross Profit - OPEX.

    const { rows } = await db.query(sql, values);
    res.json({ ok: true, summary: rows[0] });

  } catch (err) {
    logger.error("getNetProfit error", { error: err.message, tenantId });
    res.status(500).json({ ok: false, error: err.message });
  }
};
