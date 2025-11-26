const database = require('../config/database');

class Expense {
    static async create(expenseData) {
    const { description, amount, supplier, category, vendor_id, expense_date } = expenseData;

    const result = await database.query(
      `INSERT INTO expenses (description, amount, category, supplier, vendor_id, expense_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [description, amount, category, supplier, vendor_id, expense_date]
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


  static async findAll() {
    const result = await database.query(`
      SELECT e.*, v.name AS vendor_name
      FROM expenses e
      LEFT JOIN vendors v ON e.vendor_id = v.id
      ORDER BY e.expense_date DESC
    `);
    return result.rows;
  }

  static async update(id, expenseData) {
    const { description, amount, category, vendor_id, expense_date } = expenseData;

    const result = await database.query(
      `UPDATE expenses
       SET description=$1, amount=$2, category=$3, vendor_id=$4, expense_date=$5, supplier=$6
       WHERE id=$7
       RETURNING *`,
      [description, amount, category, vendor_id, expense_date, id]
    );
    return result.rows[0];
  }

static async delete(id) {
  await database.query(`DELETE FROM expenses WHERE id=$1`, [id]);
  return true;
}



}

module.exports = Expense;