const database = require('../config/database');

class Expense {

  /**
   * Create a new expense (tenant-scoped)
   */
  static async create({
    tenant_id,
    description,
    amount,
    category,
    supplier,
    vendor_id,
    expense_date
  }) {

    const result = await database.query(
      `INSERT INTO expenses (tenant_id, description, amount, category, supplier, vendor_id, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tenant_id, description, amount, category, supplier, vendor_id, expense_date, created_at, updated_at`,
      [tenant_id, description, amount, category, supplier, vendor_id, expense_date]
    );

    return result.rows[0];
  }


  /**
   * Get expenses by date range (tenant-scoped)
   */
  static async findByDateRange(startDate, endDate, { tenantId }) {
    const result = await database.query(
      `SELECT e.*, v.name AS vendor_name
       FROM expenses e
       LEFT JOIN vendors v ON e.vendor_id = v.id
       WHERE e.tenant_id = $1
         AND e.expense_date BETWEEN $2 AND $3
       ORDER BY e.expense_date DESC`,
      [tenantId, startDate, endDate]
    );

    return result.rows;
  }


  /**
   * Expense totals grouped by category (tenant-scoped)
   */
  static async getCategorySummary({ tenantId }) {
    const result = await database.query(
      `SELECT category, SUM(amount) AS total_amount
       FROM expenses
       WHERE tenant_id = $1
       GROUP BY category
       ORDER BY total_amount DESC`,
      [tenantId]
    );

    return result.rows;
  }


  /**
   * Get all expenses (tenant-scoped)
   */
  static async findAll({ tenantId }) {
    const result = await database.query(
      `SELECT e.*, v.name AS vendor_name
       FROM expenses e
       LEFT JOIN vendors v ON e.vendor_id = v.id
       WHERE e.tenant_id = $1
       ORDER BY e.expense_date DESC`,
      [tenantId]
    );

    return result.rows;
  }


  /**
   * Update expense (tenant-scoped)
   */
  static async update(id, expenseData, { tenantId }) {
    const { description, amount, category, supplier, vendor_id, expense_date } = expenseData;

    const result = await database.query(
      `UPDATE expenses
       SET description = $1,
           amount = $2,
           category = $3,
           supplier = $4,
           vendor_id = $5,
           expense_date = $6,
           updated_at = NOW()
       WHERE id = $7
         AND tenant_id = $8
       RETURNING id, tenant_id, description, amount, category, supplier, vendor_id, expense_date, created_at, updated_at`,
      [description, amount, category, supplier, vendor_id, expense_date, id, tenantId]
    );

    return result.rows[0];
  }


  /**
   * Delete expense (tenant-scoped)
   */
  static async delete(id, { tenantId }) {
    const result = await database.query(
      `DELETE FROM expenses
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [id, tenantId]
    );

    return result.rows[0];
  }
}

module.exports = Expense;
