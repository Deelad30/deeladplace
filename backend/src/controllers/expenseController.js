const database = require('../config/database');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getAllExpenses = async (req, res) => {
  try {
    const { start_date, end_date, category } = req.query;
    
    let query = 'SELECT * FROM expenses WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    if (start_date) {
      paramCount++;
      query += ` AND expense_date >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      query += ` AND expense_date <= $${paramCount}`;
      params.push(end_date);
    }
    
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
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

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Admin/Manager)
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
      [description, amount, category, supplier, expense_date]
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

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Admin/Manager)
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category, supplier, expense_date } = req.body;
    
    const result = await database.query(
      `UPDATE expenses 
       SET description = COALESCE($1, description),
           amount = COALESCE($2, amount),
           category = COALESCE($3, category),
           supplier = COALESCE($4, supplier),
           expense_date = COALESCE($5, expense_date)
       WHERE id = $6 
       RETURNING *`,
      [description, amount, category, supplier, expense_date, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense'
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin/Manager)
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};