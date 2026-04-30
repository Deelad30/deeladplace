const db = require('../config/database');
const { buildSalesFilters } = require('../utils/filterBuilder');
const logger = require('../utils/logger');


exports.getSalesPaginated = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { page = 1, limit = 20, start, end, startDate, endDate, vendor_id, payment_type, user_id } = req.query;
    start = start || startDate;
    end = end || endDate;
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    // Build filters using shared utility
    const filterResult = buildSalesFilters(tenantId, { start, end, vendor_id, payment_type, user_id });
    const { params, whereSql, paramIndex } = filterResult;

    // --------------------------------------------------
    // COUNT QUERY
    // --------------------------------------------------
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
    `;

    const countResult = await db.query(countSql, params);
    const totalRows = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(totalRows / limit);

    // --------------------------------------------------
    // DATA QUERY
    // --------------------------------------------------
    const dataSql = `
      SELECT
        ps.*,
        p.name AS product_name,
        u.name AS sold_by
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      LEFT JOIN users u ON u.id = ps.user_id
      WHERE ps.tenant_id = $1
      ${whereSql}
      ORDER BY ps.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await db.query(dataSql, dataParams);    
    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    return res.json({
      ok: true,
      items: dataResult.rows,
      total_rows: totalRows,
      total_pages: totalPages
    });

  } catch (err) {
    logger.error("getSalesPaginated error", { error: err.message, tenantId });
    return res.status(500).json({ ok: false, message: err.message });
  }
};


exports.getTransactionDetails = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { transactionId } = req.params;

  try {
    const sql = `
      SELECT
        ps.*,
        p.name AS product_name,
        p.custom_commission,
        COALESCE(ps.vendor_id, p.vendor_id) AS vendor_id,
        u.name AS sold_by
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      LEFT JOIN users u ON u.id = ps.user_id
      WHERE ps.tenant_id = $1 AND ps.transaction_id = $2
      ORDER BY ps.created_at ASC
    `;

    const result = await db.query(sql, [tenantId, transactionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Transaction not found' });
    }

    res.json({ ok: true, items: result.rows });
  } catch (err) {
    logger.error("getTransactionDetails error", { error: err.message, tenantId, transactionId });
    res.status(500).json({ ok: false, message: err.message });
  }
};


exports.getSalesReport = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { start, end, startDate, endDate } = req.query;
    start = start || startDate;
    end = end || endDate;

    const { params, whereSql } = buildSalesFilters(tenantId, { start, end });

    const sql = `
      SELECT
        ps.id,
        ps.product_id,
        p.name AS product_name,
        ps.qty,
        ps.selling_price,
        ps.commission AS unit_commission,
        (ps.qty * (ps.selling_price + ps.commission)) AS revenue,
        (ps.qty * ps.commission) AS commission,
        ps.payment_method,
        ps.order_method,
        ps.vendor_id,
        ps.created_at,
        u.name AS sold_by

      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      LEFT JOIN users u ON u.id = ps.user_id

      WHERE ps.tenant_id = $1
      ${whereSql}
      ORDER BY ps.created_at DESC
    `;

    const result = await db.query(sql, params);
    res.json({ ok: true, items: result.rows });

  } catch (err) {
    logger.error("getSalesReport error", { error: err.message, tenantId });
    res.status(500).json({ ok: false, message: err.message });
  }
};




/**
 * GET /api/reports/sales-overview
 * Query params: startDate, endDate, vendor_id (optional), payment_type (optional)
 * Response: { ok: true, overview: { total_revenue, total_commission, total_transactions, average_order_value } }
 */
exports.getSalesOverview = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    // Accept either naming convention
    let { start, end, startDate, endDate, vendor_id, payment_type, user_id } = req.query;

    start = start || startDate;
    end = end || endDate;

    // Build filters using shared utility
    const { params, whereSql } = buildSalesFilters(tenantId, { start, end, vendor_id, payment_type, user_id });


    const sql = `
      SELECT
        COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)), 0) AS total_revenue,
        COALESCE(SUM(ps.qty * ps.commission), 0) AS total_commission,
        COALESCE(COUNT(DISTINCT ps.id), 0) AS total_transactions,
        COALESCE(AVG(ps.qty * (ps.selling_price + ps.commission)), 0) AS average_order_value
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
    `;

    const result = await db.query(sql, params);
    const row = result.rows[0] || {};
const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;

    return res.json({
      ok: true,
      overview: {
        total_revenue: Number(row.total_revenue),
        total_commission: Number(row.total_commission),
        total_transactions: Number(row.total_transactions),
        average_order_value: Number(row.average_order_value),
      }
    });
  } catch (err) {
    logger.error('getSalesOverview error', { error: err.message, tenantId });
    return res.status(500).json({ ok: false, message: err.message });
  }
};


/**
 * GET /api/reports/sales-summary
 * Returns time-series summary grouped by day.
 * Query params: startDate, endDate, vendor_id, payment_type
 * Response: { ok: true, summary: [{ date, total_revenue, total_commission, total_transactions }] }
 */
exports.getSalesSummary = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { start, end, startDate, endDate, vendor_id, payment_type, user_id } = req.query;
    start = start || startDate;
    end = end || endDate;

    // Build filters using shared utility
    const { params, whereSql } = buildSalesFilters(tenantId, { start, end, vendor_id, payment_type, user_id });


    const sql = `
      SELECT
        DATE_TRUNC('day', ps.created_at AT TIME ZONE 'Africa/Lagos')::date AS date,
        COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)), 0) AS total_revenue,
        COALESCE(SUM(ps.qty * ps.commission), 0) AS total_commission,
        COALESCE(SUM(ps.qty), 0) AS total_transactions
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY DATE_TRUNC('day', ps.created_at AT TIME ZONE 'Africa/Lagos')::date
      ORDER BY date ASC
    `;

    const rows = await db.query(sql, params);

    res.json({ ok: true, summary: rows.rows });

  } catch (e) {
    logger.error("getSalesSummary error", { error: e.message, tenantId });
    res.status(500).json({ ok: false, message: e.message });
  }
};



/**
 * GET /api/reports/top-products
 * Returns products ordered by revenue (desc).
 * Query params: startDate, endDate, vendor_id, payment_type, limit (default 8)
 * Response: { ok: true, top_products: [{ product_id, product_name, total_revenue, total_qty }] }
 */
exports.getTopProducts = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { start, end, startDate, endDate, vendor_id, payment_type, user_id, limit = 8 } = req.query;
    start = start || startDate;
    end = end || endDate;

    // Build filters using shared utility
    const { params, whereSql, paramIndex } = buildSalesFilters(tenantId, { start, end, vendor_id, payment_type, user_id });


    const sql = `
      SELECT
        ps.product_id,
        COALESCE(p.name, '') AS product_name,
        SUM(ps.qty * (ps.selling_price + ps.commission)) AS total_revenue,
        SUM(ps.qty) AS total_qty
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY ps.product_id, p.name
      ORDER BY total_revenue DESC
      LIMIT $${paramIndex}
    `;

    params.push(limit);
    const result = await db.query(sql, params);

    res.json({ ok: true, top_products: result.rows });

  } catch (e) {
    logger.error("getTopProducts error", { error: e.message, tenantId });
    res.status(500).json({ ok: false, message: e.message });
  }
};


/**
 * GET /api/reports/vendor-performance
 * Returns total sales revenue per vendor.
 */
exports.getVendorPerformance = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const { whereSql, params, paramIndex } = buildSalesFilters(tenantId, req.query);

    const sql = `
      SELECT 
        v.id AS vendor_id,
        COALESCE(v.name, 'Unknown') AS vendor_name,
        SUM(ps.qty * (ps.selling_price + ps.commission)) AS total_revenue
      FROM pos_sales ps
      LEFT JOIN vendors v ON v.id = ps.vendor_id
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY v.id, v.name
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(sql, params);
    res.json({ ok: true, vendor_performance: result.rows });

  } catch (e) {
    logger.error("getVendorPerformance error", { error: e.message, tenantId });
    res.status(500).json({ ok: false, message: e.message });
  }
};


/**
 * GET /api/reports/payment-summary
 * Returns totals by payment method.
 * Query params: startDate, endDate, vendor_id
 * Response: { ok: true, payment_summary: { cash, pos, transfer, card, multiple, other } }
 */
exports.getPaymentSummary = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { start, end, startDate, endDate, vendor_id, user_id } = req.query;
    start = start || startDate;
    end = end || endDate;

    // Build filters using shared utility (no payment_type filter for this endpoint)
    const { params, whereSql } = buildSalesFilters(tenantId, { start, end, vendor_id, user_id });

    // Fetch individual sales with breakdown info instead of grouping
    const sql = `
      SELECT 
        ps.payment_method, 
        ps.payment_breakdown,
        ps.qty, 
        ps.selling_price, 
        ps.commission
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
    `;

    const rows = await db.query(sql, params);
    
    // Initialize summary
    const summary = {
      cash: 0,
      pos: 0, 
      transfer: 0,
      card: 0,
      multiple: 0, 
      other: 0
    };

    rows.rows.forEach(r => {
      let method = (r.payment_method || 'other').toLowerCase();
      // Normalize 'pos' to 'card'
      if (method === 'pos') method = 'card';

      // Calculate total revenue for this line item (Product Price + Commission)
      const totalItemRevenue = Number(r.qty) * (Number(r.selling_price) + Number(r.commission || 0));

      if (method === 'multiple') {
        // Parse breakdown
        let breakdown = [];
        try {
          if (typeof r.payment_breakdown === 'string') {
             breakdown = JSON.parse(r.payment_breakdown);
          } else if (Array.isArray(r.payment_breakdown)) {
             breakdown = r.payment_breakdown;
          }
        } catch (e) {
          // ignore parse error
        }

        if (breakdown && breakdown.length > 0) {
          let totalBreakdownSum = 0;
          breakdown.forEach(b => totalBreakdownSum += Number(b.amount || 0));

          if (totalBreakdownSum > 0) {
            const ratio = totalItemRevenue / totalBreakdownSum;
            
            breakdown.forEach(p => {
              let pMethod = (p.method || 'other').toLowerCase();
              if (pMethod === 'pos') pMethod = 'card';
              
              const pAmount = Number(p.amount || 0) * ratio; // Prorate
              summary[pMethod] = (summary[pMethod] || 0) + pAmount;
            });
          } else {
             summary['multiple'] = (summary['multiple'] || 0) + totalItemRevenue;
          }

        } else {
          // No breakdown info, dump into 'multiple'
          summary['multiple'] = (summary['multiple'] || 0) + totalItemRevenue;
        }

      } else {
        // Single payment method
        summary[method] = (summary[method] || 0) + totalItemRevenue;
      }
    });

    // Final clean up: Round values and remove zeros
    const finalSummary = {};
    for (const [key, val] of Object.entries(summary)) {
        const rounded = Math.round(val);
        if (rounded > 0) {
            finalSummary[key] = rounded;
        }
    }
    
    // Ensure standard keys exist if they are 0? No, charts usually prefer omitting or handling 0. 
    // But for consistency let's ensure 'cash', 'card', 'transfer' at least exist if they are main ones?
    // User complaint was "Others appeared". If Other is 0, it won't appear now.
    
    res.json({ ok: true, payment_summary: finalSummary });

  } catch (e) {
    logger.error("getPaymentSummary error", { error: e.message, tenantId });
    res.status(500).json({ ok: false, message: e.message });
  }
};

/**
 * GET /api/reports/customer-type-summary
 * Returns revenue totals grouped by order method (walk-in vs online).
 * Query params: start, end, vendor_id, user_id
 * Response: { ok: true, customer_type_summary: { "walk-in": 120000, "online": 45000 } }
 */
exports.getCustomerTypeSummary = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    let { start, end, startDate, endDate, vendor_id, user_id } = req.query;
    start = start || startDate;
    end = end || endDate;

    const { params, whereSql } = buildSalesFilters(tenantId, { start, end, vendor_id, user_id });

    const sql = `
      SELECT 
        ps.order_method,
        COUNT(DISTINCT ps.transaction_id) as customer_count
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY ps.order_method
    `;

    const result = await db.query(sql, params);

    const summary = {};
    result.rows.forEach(r => {
      const method = (r.order_method || 'walk-in').toLowerCase();
      const label = method === 'online' ? 'Online' : 'Walk-in';
      summary[label] = (summary[label] || 0) + Number(r.customer_count);
    });

    res.json({ ok: true, customer_type_summary: summary });

  } catch (e) {
    logger.error("getCustomerTypeSummary error", { error: e.message, tenantId });
    res.status(500).json({ ok: false, message: e.message });
  }
};


exports.getProfitSummary = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

    let { start, end, startDate, endDate } = req.query;
    start = start || startDate;
    end = end || endDate;

    // Helper to compute profit for a specific range
    const computeProfit = async (s, e) => {
      // Use Africa/Lagos for date boundaries
      const sql = `
        SELECT
          COALESCE(SUM((ps.qty * (ps.selling_price + ps.commission)) - (ps.qty * COALESCE(sc_latest.tcop,0))), 0) AS total_profit
        FROM pos_sales ps
        LEFT JOIN products p ON p.id = ps.product_id
        LEFT JOIN LATERAL (
          SELECT sc.tcop
          FROM standard_costs sc
          WHERE sc.product_id = p.id AND sc.tenant_id = ps.tenant_id
          ORDER BY sc.created_at DESC
          LIMIT 1
        ) sc_latest ON true
        WHERE ps.tenant_id = $1
          AND (ps.created_at AT TIME ZONE 'Africa/Lagos')::date >= $2::date
          AND (ps.created_at AT TIME ZONE 'Africa/Lagos')::date <= $3::date
      `;
      const { rows } = await db.query(sql, [tenantId, s, e]);
      return Number(rows[0].total_profit || 0);
    };

    if (start && end) {
      const profit = await computeProfit(start, end);
      logger.info('Profit Summary (Range)', { tenantId, start, end, profit });
      return res.json({ ok: true, profit: { total: profit } });
    }

    // Default: Today and This Month (Nigeria Time)
    const lagosNow = new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"});
    const d = new Date(lagosNow);
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const monthStart = today.substring(0, 8) + '01';
    const todayProfit = await computeProfit(today, today);
    const thisMonthProfit = await computeProfit(monthStart, today);

    logger.info('Profit Summary (Default)', { tenantId, today, todayProfit, thisMonthProfit });

    res.json({
      ok: true,
      profit: {
        today: todayProfit,
        this_month: thisMonthProfit
      }
    });

  } catch (err) {
    logger.error('getProfitSummary error', { error: err.message, tenantId });
    res.status(500).json({ ok: false, message: err.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {

    let { start, end, startDate, endDate } = req.query;
    start = start || startDate;
    end = end || endDate;

    const computeExpense = async (s, e) => {
      const sql = `
        SELECT COALESCE(SUM(amount),0) AS total_expense
        FROM expenses
        WHERE tenant_id = $1
          AND expense_date::date >= $2::date
          AND expense_date::date <= $3::date
      `;
      const { rows } = await db.query(sql, [tenantId, s, e]);
      return Number(rows[0].total_expense || 0);
    };

    if (start && end) {
      const expense = await computeExpense(start, end);
      return res.json({ ok: true, expense: { total: expense } });
    }

    // Default: Today and This Month
    const lagosNow = new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"});
    const d = new Date(lagosNow);
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const monthStart = today.substring(0, 8) + '01';

    const todayExpense = await computeExpense(today, today);
    const thisMonthExpense = await computeExpense(monthStart, today);

    // Logging result
    logger.info("Expense Summary", { todayExpense, thisMonthExpense, tenantId });

    res.json({
      ok: true,
      expense: {
        today: todayExpense,
        this_month: thisMonthExpense
      }
    });

  } catch (err) {
    logger.error('getExpenseSummary error', { error: err.message, tenantId });
    res.status(500).json({ ok: false, message: err.message });
  }
};

