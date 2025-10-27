const database = require('../config/database');

class Expense {
  static async create(expenseData) {
    const { description, amount, category, supplier, expense_date } = expenseData;
    const result = await database.query(
      'INSERT INTO expenses (description, amount, category, supplier, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [description, amount, category, supplier, expense_date]
    );
    return result.rows[0];
  }

  static async findByDateRange(startDate, endDate) {
    const result = await database.query(
      'SELECT * FROM expenses WHERE expense_date BETWEEN $1 AND $2 ORDER BY expense_date DESC',
      [startDate, endDate]
    );
    return result.rows;
  }

  static async getCategorySummary() {
    const result = await database.query(`
      SELECT category, SUM(amount) as total_amount
      FROM expenses 
      GROUP BY category
      ORDER BY total_amount DESC
    `);
    return result.rows;
  }
}

module.exports = Expense;