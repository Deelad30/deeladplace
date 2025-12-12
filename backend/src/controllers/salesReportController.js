
const db = require('../config/database');

function buildDateFilterParams(startDate, endDate) {
  // returns SQL snippet and params array indexes will be used by caller
  // We'll use $1 for tenantId in caller, so this returns text using $2 and $3
  const conditions = [];
  if (startDate) conditions.push(`ps.created_at >= $2::timestamptz`);
  if (endDate) conditions.push(`ps.created_at <= $3::timestamptz`);
  const where = conditions.length ? `AND ${conditions.join(' AND ')}` : '';
  return where;
}

exports.getSalesPaginated = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    let { page = 1, limit = 20, start, end, vendor_id, payment_type } = req.query;
    page = Number(page);
    limit = Number(limit);

    const offset = (page - 1) * limit;

    const params = [tenantId];
    let paramIndex = 2;
    const filters = [];

    // --------------------------------------------------
    // DATE FILTER FIX: Expand date range to full days
    // --------------------------------------------------
    if (start) {
      const startTimestamp = `${start} 00:00:00`;
      params.push(startTimestamp);
      filters.push(`ps.created_at >= $${paramIndex++}::timestamptz`);
    }

    if (end) {
      const endTimestamp = `${end} 23:59:59.999`;
      params.push(endTimestamp);
      filters.push(`ps.created_at <= $${paramIndex++}::timestamptz`);
    }

    // --------------------------------------------------
    // Vendor filter
    // --------------------------------------------------
    if (vendor_id) {
      params.push(vendor_id);
      filters.push(`ps.vendor_id = $${paramIndex++}`);
    }

    // --------------------------------------------------
    // Payment filter
    // --------------------------------------------------
    if (payment_type) {
      params.push(payment_type);
      filters.push(`ps.payment_method = $${paramIndex++}`);
    }

    const whereSql = filters.length ? `AND ${filters.join(" AND ")}` : "";

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
      SELECT ps.*, p.name AS product_name
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
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
    console.error("getSalesPaginated error", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};


exports.getSalesReport = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    let { start, end } = req.query;

    if (start) start = `${start} 00:00:00`;
    if (end) end = `${end} 23:59:59.999`;

    const sql = `
      SELECT
        ps.id,
        ps.product_id,
        p.name AS product_name,
        ps.qty,
        ps.selling_price,
        p.custom_commission,
        (ps.qty * ps.selling_price) AS revenue,
        (ps.qty * COALESCE(p.custom_commission, 0)) AS commission,
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

    const params = [tenantId, start || null, end || null];
    const result = await db.query(sql, params);

    res.json({ ok: true, items: result.rows });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: e.message });
  }
};



/**
 * GET /api/reports/sales-overview
 * Query params: startDate, endDate, vendor_id (optional), payment_type (optional)
 * Response: { ok: true, overview: { total_revenue, total_commission, total_transactions, average_order_value } }
 */
exports.getSalesOverview = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    // Accept either naming convention
    let { start, end, startDate, endDate, vendor_id, payment_type } = req.query;

    start = start || startDate;
    end = end || endDate;

    // Normalize to full day
    if (start) start = `${start} 00:00:00`;
    if (end)   end   = `${end} 23:59:59.999`;

    let paramIndex = 2;
    const filters = [];
    const params = [tenantId];

    if (start) { params.push(start); filters.push(`ps.created_at >= $${paramIndex++}::timestamptz`); }
    if (end)   { params.push(end);   filters.push(`ps.created_at <= $${paramIndex++}::timestamptz`); }
    if (vendor_id) { params.push(vendor_id); filters.push(`ps.vendor_id = $${paramIndex++}`); }
    if (payment_type) { params.push(payment_type); filters.push(`ps.payment_method = $${paramIndex++}`); }

    const whereSql = filters.length ? `AND ${filters.join(' AND ')}` : '';

    const sql = `
      SELECT
        COALESCE(SUM(ps.qty * ps.selling_price), 0) AS total_revenue,
        COALESCE(SUM(ps.qty * COALESCE(p.custom_commission, 0)), 0) AS total_commission,
        COALESCE(COUNT(DISTINCT ps.id), 0) AS total_transactions,
        COALESCE(NULLIF(AVG(ps.qty * ps.selling_price), NULL), 0) AS average_order_value
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      WHERE ps.tenant_id = $1
      ${whereSql}
    `;

    const result = await db.query(sql, params);
    const row = result.rows[0] || {};

    return res.json({
      ok: true,
      overview: {
        total_revenue: Number(row.total_revenue || 0),
        total_commission: Number(row.total_commission || 0),
        total_transactions: Number(row.total_transactions || 0),
        average_order_value: Number(row.average_order_value || 0),
      }
    });
  } catch (err) {
    console.error('getSalesOverview error', err);
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
  try {
    const tenantId = req.user.tenant_id;
    let { start, end, vendor_id, payment_type } = req.query;

    if (start) start = `${start} 00:00:00`;
    if (end)   end   = `${end} 23:59:59.999`;

    let paramIndex = 2;
    const filters = [];
    const params = [tenantId];

    if (start) { params.push(start); filters.push(`ps.created_at >= $${paramIndex++}::timestamptz`); }
    if (end)   { params.push(end);   filters.push(`ps.created_at <= $${paramIndex++}::timestamptz`); }
    if (vendor_id) { params.push(vendor_id); filters.push(`ps.vendor_id = $${paramIndex++}`); }
    if (payment_type) { params.push(payment_type); filters.push(`ps.payment_method = $${paramIndex++}`); }

    const whereSql = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const sql = `
      SELECT
        DATE_TRUNC('day', ps.created_at)::date AS date,
        COALESCE(SUM(ps.qty * ps.selling_price), 0) AS total_revenue,
        COALESCE(SUM(ps.qty * COALESCE(p.custom_commission, 0)), 0) AS total_commission,
        COALESCE(SUM(ps.qty), 0) AS total_transactions
      FROM pos_sales ps
      LEFT JOIN products p ON p.id = ps.product_id
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY DATE_TRUNC('day', ps.created_at)::date
      ORDER BY date ASC
    `;

    const rows = await db.query(sql, params);

    res.json({ ok: true, summary: rows.rows });

  } catch (e) {
    console.error(e);
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
  try {
    const tenantId = req.user.tenant_id;
    let { start, end, vendor_id, payment_type, limit = 8 } = req.query;

    if (start) start = `${start} 00:00:00`;
    if (end)   end   = `${end} 23:59:59.999`;

    let paramIndex = 2;
    const filters = [];
    const params = [tenantId];

    if (start) { params.push(start); filters.push(`ps.created_at >= $${paramIndex++}::timestamptz`); }
    if (end)   { params.push(end);   filters.push(`ps.created_at <= $${paramIndex++}::timestamptz`); }
    if (vendor_id) { params.push(vendor_id); filters.push(`ps.vendor_id = $${paramIndex++}`); }
    if (payment_type) { params.push(payment_type); filters.push(`ps.payment_method = $${paramIndex++}`); }

    const whereSql = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const sql = `
      SELECT
        ps.product_id,
        COALESCE(p.name, '') AS product_name,
        SUM(ps.qty * ps.selling_price) AS total_revenue,
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
    console.error(e);
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
  try {
    const tenantId = req.user.tenant_id;
    let { start, end, vendor_id } = req.query;

    if (start) start = `${start} 00:00:00`;
    if (end)   end   = `${end} 23:59:59.999`;

    let paramIndex = 2;
    const filters = [];
    const params = [tenantId];

    if (start) { params.push(start); filters.push(`ps.created_at >= $${paramIndex++}::timestamptz`); }
    if (end)   { params.push(end);   filters.push(`ps.created_at <= $${paramIndex++}::timestamptz`); }
    if (vendor_id) { params.push(vendor_id); filters.push(`ps.vendor_id = $${paramIndex++}`); }

    const whereSql = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const sql = `
      SELECT ps.payment_method, SUM(ps.qty * ps.selling_price) AS amount
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
      ${whereSql}
      GROUP BY ps.payment_method
    `;

    const rows = await db.query(sql, params);
    const summary = {};

    rows.rows.forEach(r => {
      const key = (r.payment_method || 'other').toLowerCase();
      summary[key] = Number(r.amount);
    });

    res.json({ ok: true, payment_summary: summary });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: e.message });
  }
};

