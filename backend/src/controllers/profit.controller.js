const db = require("../config/database");
const logger = require('../utils/logger');
const { buildSalesFilters } = require('../utils/filterBuilder');

/**
 * PRODUCT PROFITABILITY
 * (Selling Price + Commission - Cost Price) × Quantity Sold
 */
exports.getProductProfitability = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { startDate, endDate, productId, categoryId, vendorId } = req.query;

    const { params, whereSql } = buildSalesFilters(tenantId, { 
      start: startDate, 
      end: endDate, 
      vendor_id: vendorId,
      user_id: req.query.userId // Support userId filter if passed
    });

    // Handle categoryId separately as it's on the products table
    let categoryFilter = "";
    if (categoryId) {
      params.push(categoryId);
      categoryFilter = ` AND p.category_id = $${params.length}`;
    }

    // Handle productId specifically
    let productFilter = "";
    if (productId) {
      params.push(productId);
      productFilter = ` AND ps.product_id = $${params.length}`;
    }

    const sql = `
      SELECT
        ps.product_id,
        p.name AS product_name,
        SUM(ps.qty) AS total_qty,
        SUM(ps.qty * (ps.selling_price + ps.commission)) AS total_sales,
        COALESCE(sc_latest.tcop, 0) AS cost_per_unit,
        SUM(ps.qty * COALESCE(sc_latest.tcop, 0)) AS total_cost,
        SUM(ps.qty * (ps.selling_price + ps.commission)) - SUM(ps.qty * COALESCE(sc_latest.tcop, 0)) AS gross_profit
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      LEFT JOIN LATERAL (
        SELECT sc.tcop
        FROM standard_costs sc
        WHERE sc.product_id = p.id
          AND sc.tenant_id = ps.tenant_id
        ORDER BY sc.created_at DESC
        LIMIT 1
      ) sc_latest ON true
      WHERE ps.tenant_id = $1
      ${whereSql}
      ${categoryFilter}
      ${productFilter}
      GROUP BY ps.product_id, p.name, sc_latest.tcop
      ORDER BY gross_profit DESC;
    `;

    const { rows } = await db.query(sql, params);
    res.json({ ok: true, items: rows });


  } catch (err) {
    logger.error("getProductProfitability error", { error: err.message, tenantId });
    res.status(500).json({ ok: false, error: err.message });
  }
};

/**
 * NET PROFIT
 * Gross Profit - Total Expenses
 */
exports.getNetProfit = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { startDate, endDate, productId, categoryId, vendorId } = req.query;

    const { params, whereSql } = buildSalesFilters(tenantId, { 
      start: startDate, 
      end: endDate, 
      vendor_id: vendorId,
      user_id: req.query.userId
    });

    // Expenses use the same date range but need their own filter building logic 
    // because they don't have all the sales table columns
    const expenseFilters = [`tenant_id = $1`];
    const expenseParams = [tenantId];
    let eIdx = 2;

    if (startDate) {
      expenseFilters.push(`expense_date::date >= $${eIdx}::date`);
      expenseParams.push(startDate);
      eIdx++;
    }
    if (endDate) {
      expenseFilters.push(`expense_date::date <= $${eIdx}::date`);
      expenseParams.push(endDate);
      eIdx++;
    }

    const sql = `
      WITH product_profit AS (
        SELECT 
          COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)) - SUM(ps.qty * COALESCE(sc_latest.tcop, 0)), 0) AS total_product_profit,
          COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)), 0) AS total_sales
        FROM pos_sales ps
        LEFT JOIN products p ON p.id = ps.product_id
        LEFT JOIN LATERAL (
          SELECT sc.tcop
          FROM standard_costs sc
          WHERE sc.product_id = p.id
            AND sc.tenant_id = ps.tenant_id
          ORDER BY sc.created_at DESC
          LIMIT 1
        ) sc_latest ON true
        WHERE ps.tenant_id = $1
        ${whereSql}
      ),
      expenses AS (
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE ${expenseFilters.join(" AND ")} AND status = 'settled'
      )
      SELECT
        pp.total_sales,
        pp.total_product_profit,
        e.total_expenses,
        (pp.total_product_profit - e.total_expenses) AS net_profit
      FROM product_profit pp, expenses e;
    `;

    // Note: Net Profit is now Gross Profit - Expenses
    const { rows } = await db.query(sql, params);
    res.json({ ok: true, summary: rows[0] });

  } catch (err) {
    logger.error("getNetProfit error", { error: err.message, tenantId });
    res.status(500).json({ ok: false, error: err.message });
  }
};

