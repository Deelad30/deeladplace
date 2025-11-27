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

   static normalizeDates(startDate, endDate) {
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);           // Start of day
    if (end) end.setHours(23, 59, 59, 999);         // End of day

    return {
      startDate: start ? start.toISOString() : null,
      endDate: end ? end.toISOString() : null
    };
  }


  static async findByDateRange(startDate, endDate) {
    const result = await database.query(
      'SELECT * FROM sales WHERE sale_date BETWEEN $1 AND $2 ORDER BY sale_date DESC',
      [startDate, endDate]
    );
    return result.rows;
  }


  
  // Get daily summary
  static async getDailySummary({ vendor_id = null, startDate = null, endDate = null } = {}) {
    ({ startDate, endDate } = this.normalizeDates(startDate, endDate));

    const params = [];
    const where = [];

    if (vendor_id) {
      params.push(vendor_id);
      where.push(`vendor_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      where.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      where.push(`sale_date <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT 
        DATE(sale_date) AS date,
        SUM(customer_price)::numeric AS total_revenue,
        SUM(hub_commission)::numeric AS total_commission
      FROM sales
      ${whereSql}
      GROUP BY date
      ORDER BY date ASC
    `;

    const result = await database.query(sql, params);
    return result.rows;
  }


  // -----------------------
  // New analytics functions
  // -----------------------

  // Overview stats for KPI cards
  // Overview stats for KPI cards
  static async getOverview({ vendor_id = null, startDate = null, endDate = null } = {}) {
    ({ startDate, endDate } = this.normalizeDates(startDate, endDate));

    const params = [];
    const where = [];

    if (vendor_id) {
      params.push(vendor_id);
      where.push(`vendor_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      where.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      where.push(`sale_date <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT
        COALESCE(SUM(customer_price), 0) AS total_revenue,
        COALESCE(SUM(hub_commission), 0) AS total_commission,
        COUNT(*)::int AS total_transactions,
        COALESCE(AVG(customer_price), 0) AS average_order_value
      FROM sales
      ${whereSql}
    `;

    const result = await database.query(sql, params);
    return result.rows[0];
  }


  // Top products by revenue (or quantity) in a date range (default 30 days)
// Top products
  static async getTopProducts({ vendor_id = null, startDate = null, endDate = null, limit = 10 } = {}) {
    ({ startDate, endDate } = this.normalizeDates(startDate, endDate));

    const params = [];
    const where = [];

    if (vendor_id) {
      params.push(vendor_id);
      where.push(`s.vendor_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      where.push(`s.sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      where.push(`s.sale_date <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT 
        p.id AS product_id,
        COALESCE(p.name, CONCAT('product_', s.product_id::text)) AS product_name,
        SUM(s.customer_price)::numeric AS total_revenue,
        SUM(s.quantity)::int AS total_quantity
      FROM sales s
      LEFT JOIN products p ON p.id = s.product_id
      ${whereSql}
      GROUP BY p.id, p.name, s.product_id
      ORDER BY total_revenue DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await database.query(sql, params);
    return result.rows;
  }


  // Payment breakdown by sum(customer_price)
// Payment summary
  static async getPaymentSummary({ vendor_id = null, startDate = null, endDate = null } = {}) {
    ({ startDate, endDate } = this.normalizeDates(startDate, endDate));

    const params = [];
    const where = [];

    if (vendor_id) {
      params.push(vendor_id);
      where.push(`vendor_id = $${params.length}`);
    }
    if (startDate) {
      params.push(startDate);
      where.push(`sale_date >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      where.push(`sale_date <= $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT payment_type, SUM(customer_price)::numeric AS total
      FROM sales
      ${whereSql}
      GROUP BY payment_type
      ORDER BY total DESC
    `;

    const res = await database.query(sql, params);
    const summary = {};
    res.rows.forEach(row => summary[row.payment_type] = row.total);
    return summary;
  }



  // Paginated sales with filters
// Paginated sales with filters
static async getPaginatedSales({
  page = 1,
  limit = 20,
  startDate = null,
  endDate = null,
  vendor_id = null,
  product_id = null,
  payment_type = null
} = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];

  // Filter by start date
  if (startDate) {
    params.push(startDate);
    where.push(`s.sale_date >= $${params.length}`);
  }

  // Filter by end date (include full day)
  if (endDate) {
    params.push(endDate + 'T23:59:59');
    where.push(`s.sale_date <= $${params.length}`);
  }

  if (vendor_id) {
    params.push(vendor_id);
    where.push(`s.vendor_id = $${params.length}`);
  }

  if (product_id) {
    params.push(product_id);
    where.push(`s.product_id = $${params.length}`);
  }

  if (payment_type) {
    params.push(payment_type);
    where.push(`s.payment_type = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Total rows count
  const countSql = `SELECT COUNT(*)::int AS total_rows FROM sales s ${whereSql}`;
  const countResult = await database.query(countSql, params);
  const totalRows = countResult.rows[0].total_rows || 0;
  const totalPages = Math.ceil(totalRows / limit);

  // Data query with proper aliasing
  const dataParams = [...params, limit, offset]; // limit and offset are last
  const dataSql = `
    SELECT 
      s.*,
      COALESCE(p.name, '') AS product_name
    FROM sales s
    LEFT JOIN products p ON p.id = s.product_id
    ${whereSql}
    ORDER BY s.sale_date DESC
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
