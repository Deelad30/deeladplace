const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "Missing tenant ID" });
    }

    const {
      description,
      amount,
      category,
      supplier,
      vendor_id,
      expense_date
    } = req.body;

    const expense = await Expense.create({
      tenant_id: tenantId,
      description,
      amount,
      category,
      supplier,
      vendor_id,
      expense_date: expense_date || new Date()
    });

    res.status(201).json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: "Error creating expense"
    });
  }
};


exports.getExpenseSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const summary = await Expense.getCategorySummary({ tenantId });

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


exports.getAllExpenses = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;

    const expenses = await Expense.findAll({ tenantId });

    res.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const updatedExpense = await Expense.update(id, req.body, { tenantId });

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      expense: updatedExpense
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense'
    });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const deleted = await Expense.delete(id, { tenantId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
};
