const database = require('../config/database');

const getExpenses = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;
    
    let query = 'SELECT * FROM expenses';
    let conditions = [];
    let params = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      conditions.push(`expense_date >= $${paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      conditions.push(`expense_date <= $${paramCount}`);
      params.push(end_date);
    }

    if (category) {
      paramCount++;
      conditions.push(`category = $${paramCount}`);
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY expense_date DESC';

    const result = await database.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      expenses: result.rows
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};

const createExpense = async (req, res) => {
  try {
    const { description, amount, category, supplier, expense_date } = req.body;

    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required'
      });
    }

    const result = await database.query(
      `INSERT INTO expenses (description, amount, category, supplier, expense_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [description, amount, category, supplier, expense_date || new Date()]
    );

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense: result.rows[0]
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording expense'
    });
  }
};

module.exports = {
  getExpenses,
  createExpense
};