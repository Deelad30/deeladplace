const database = require('../config/database');

class Sale {
  static async create(saleData) {
    const { vendor_id, product_id, quantity, vendor_price, hub_commission, customer_price } = saleData;
    const result = await database.query(
      'INSERT INTO sales (vendor_id, product_id, quantity, vendor_price, hub_commission, customer_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [vendor_id, product_id, quantity, vendor_price, hub_commission, customer_price]
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

  static async getDailySummary() {
    const result = await database.query(`
      SELECT DATE(sale_date) as date, 
             COUNT(*) as transaction_count,
             SUM(customer_price) as total_revenue,
             SUM(hub_commission) as total_commission
      FROM sales 
      WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
    `);
    return result.rows;
  }
}

module.exports = Sale;