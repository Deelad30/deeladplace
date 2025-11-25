// models/Sale.js
const database = require('../config/database');

class Sale {

  static async create(saleData) {
    const {
      vendor_id,
      product_id,
      quantity,
      vendor_price,
      hub_commission,
      customer_price,
      customer_type,
      payment_type,
      payment_breakdown
    } = saleData;

    const result = await database.query(
      `INSERT INTO sales (
        vendor_id,
        product_id,
        quantity,
        vendor_price,
        hub_commission,
        customer_price,
        customer_type,
        payment_type,
        payment_breakdown
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        vendor_id,
        product_id,
        quantity,
        vendor_price,
        hub_commission,
        customer_price,
        customer_type,
        payment_type,
        JSON.stringify(payment_breakdown || {})
      ]
    );

    return result.rows[0];
  }

  static async findByDateRange(startDate, endDate) {
    const result = await database.query(
      'SELECT * FROM sales WHERE sale_date BETWEEN $1 AND $2 ORDER BY sale_date DESC',
      [startDate, endDate]
    );
    return result.rows;
  }

  static async getDailySummary(days = 30) {
    const result = await database.query(`
      SELECT DATE(sale_date) as date, 
             COUNT(*)::int as transaction_count,
             COALESCE(SUM(customer_price),0)::numeric as total_revenue,
             COALESCE(SUM(hub_commission),0)::numeric as total_commission
      FROM sales 
      WHERE sale_date >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
    `);
    return result.rows;
  }

  // -----------------------
  // New analytics functions
  // -----------------------

  // Overview stats for KPI cards
  static async getOverview() {
    const result = await database.query(`
      SELECT
        COALESCE( (SELECT SUM(customer_price) FROM sales WHERE DATE(sale_date) = CURRENT_DATE), 0) AS today_revenue,
        COALESCE( (SELECT SUM(customer_price) FROM sales WHERE sale_date >= date_trunc('month', CURRENT_DATE)), 0) AS month_revenue,
        COALESCE( (SELECT COUNT(*) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'), 0) AS total_transactions_30d,
        COALESCE( (SELECT AVG(customer_price) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'), 0) AS average_order_value_30d,
        COALESCE( (SELECT SUM(hub_commission) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'), 0) AS total_commission_30d
    `);

    // result.rows[0] will contain the values
    return result.rows[0];
  }

  // Top products by revenue (or quantity) in a date range (default 30 days)
  static async getTopProducts({ startDate = null, endDate = null, limit = 10, by = 'revenue' } = {}) {
    const params = [];
    const whereClauses = [];

    if (startDate) {
      params.push(startDate);
      whereClauses.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      whereClauses.push(`sale_date <= $${params.length}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : `WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'`;

    // choose aggregation
    const agg = by === 'quantity' ? 'SUM(quantity)' : 'SUM(customer_price)';

    // join to products table to get product name (if it exists)
    const sql = `
      SELECT
        p.id as product_id,
        COALESCE(p.name, CONCAT('product_', s.product_id::text)) as product_name,
        ${agg}::numeric AS metric
      FROM sales s
      LEFT JOIN products p ON p.id = s.product_id
      ${whereSql}
      GROUP BY p.id, p.name, s.product_id
      ORDER BY metric DESC
      LIMIT $${params.length + 1}
    `;

    params.push(limit);

    const result = await database.query(sql, params);
    return result.rows;
  }

  // Payment breakdown by sum(customer_price)
  static async getPaymentSummary({ startDate = null, endDate = null } = {}) {
    const params = [];
    const whereClauses = [];

    if (startDate) {
      params.push(startDate);
      whereClauses.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      whereClauses.push(`sale_date <= $${params.length}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT
        payment_type,
        COALESCE(SUM(customer_price), 0)::numeric AS total
      FROM sales
      ${whereSql}
      GROUP BY payment_type
      ORDER BY total DESC
    `;

    const result = await database.query(sql, params);
    // convert rows into an object { payment_type: total, ... }
    const summary = {};
    for (const row of result.rows) {
      summary[row.payment_type || 'unknown'] = row.total;
    }
    return summary;
  }

  // Paginated sales with filters
  static async getPaginatedSales({ page = 1, limit = 20, startDate = null, endDate = null, vendor_id = null, product_id = null, payment_type = null } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const where = [];

    if (startDate) {
      params.push(startDate);
      where.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      where.push(`sale_date <= $${params.length}`);
    }
    if (vendor_id) {
      params.push(vendor_id);
      where.push(`vendor_id = $${params.length}`);
    }
    if (product_id) {
      params.push(product_id);
      where.push(`product_id = $${params.length}`);
    }
    if (payment_type) {
      params.push(payment_type);
      where.push(`payment_type = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // total rows count
    const countSql = `SELECT COUNT(*)::int as total_rows FROM sales ${whereSql}`;
    const countResult = await database.query(countSql, params);
    const totalRows = countResult.rows[0].total_rows || 0;
    const totalPages = Math.ceil(totalRows / limit);

    // data query: join product name (if available)
    const dataParams = params.slice(); // copy
    dataParams.push(limit);
    dataParams.push(offset);

    const dataSql = `
      SELECT s.*,
             COALESCE(p.name, '') as product_name
      FROM sales s
      LEFT JOIN products p ON p.id = s.product_id
      ${whereSql}
      ORDER BY sale_date DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `;

    const dataResult = await database.query(dataSql, dataParams);

    return {
      page,
      limit,
      total_rows: totalRows,
      total_pages: totalPages,
      data: dataResult.rows
    };
  }

  // Vendor summary: total sales and commission per vendor (optionally limited)
  static async getVendorsSummary({ startDate = null, endDate = null, limit = 50 } = {}) {
    const params = [];
    const whereClauses = [];

    if (startDate) {
      params.push(startDate);
      whereClauses.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      whereClauses.push(`sale_date <= $${params.length}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // left join vendors table if it exists for vendor names
    const sql = `
      SELECT
        s.vendor_id,
        COALESCE(v.name, CONCAT('vendor_', s.vendor_id::text)) AS vendor_name,
        COUNT(*)::int AS transaction_count,
        COALESCE(SUM(s.customer_price),0)::numeric AS total_sales,
        COALESCE(SUM(s.hub_commission),0)::numeric AS total_commission
      FROM sales s
      LEFT JOIN vendors v ON v.id = s.vendor_id
      ${whereSql}
      GROUP BY s.vendor_id, v.name
      ORDER BY total_sales DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await database.query(sql, params);
    return result.rows;
  }

}

module.exports = Sale;
