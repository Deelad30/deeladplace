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

  static async findAll() {
  const result = await database.query(`
    SELECT * FROM expenses 
    ORDER BY expense_date DESC
  `);

  return result.rows;
}

static async update(id, expenseData) {
  const { description, amount, category, supplier, expense_date } = expenseData;
  const result = await database.query(
    `UPDATE expenses
     SET description=$1, amount=$2, category=$3, supplier=$4, expense_date=$5
     WHERE id=$6
     RETURNING *`,
    [description, amount, category, supplier, expense_date, id]
  );
  return result.rows[0];
}

static async delete(id) {
  await database.query(`DELETE FROM expenses WHERE id=$1`, [id]);
  return true;
}



}

module.exports = Expense;