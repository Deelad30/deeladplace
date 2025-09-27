const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
  try {
    const { description, amount, category, supplier, expense_date } = req.body;

    const expense = await Expense.create({
      description,
      amount,
      category,
      supplier,
      expense_date: expense_date || new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording expense'
    });
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.getCategorySummary();
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense summary'
    });
  }
};

module.exports = {
  createExpense,
  getExpenseSummary
};