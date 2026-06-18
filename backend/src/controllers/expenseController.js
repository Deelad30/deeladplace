const Expense = require('../models/Expense');
const logger = require('../utils/logger');
const database = require('../config/database');

const normalizeSupplier = async (supplier, tenantId) => {
  if (!supplier) return supplier;
  try {
    const result = await database.query(
      `SELECT supplier FROM expenses 
       WHERE tenant_id = $1 AND LOWER(supplier) = LOWER($2) 
       LIMIT 1`,
      [tenantId, supplier.trim()]
    );
    if (result.rows.length > 0) {
      return result.rows[0].supplier;
    }
    return supplier.trim();
  } catch (error) {
    return supplier;
  }
};

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
      expense_date,
      status
    } = req.body;

    const normalizedSupplier = await normalizeSupplier(supplier, tenantId);

    const expense = await Expense.create({
      tenant_id: tenantId,
      description,
      amount,
      category,
      supplier: normalizedSupplier,
      vendor_id,
      expense_date: expense_date || new Date(),
      status: status || 'unsettled'
    });

    res.status(201).json({
      success: true,
      expense
    });

  } catch (error) {
    logger.error('Create expense error', { error: error.message, tenantId });
    res.status(500).json({
      success: false,
      message: "Error creating expense"
    });
  }
};

exports.bulkCreateExpenses = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses)) {
      return res.status(400).json({ success: false, message: "Invalid expenses data" });
    }

    const createdExpenses = [];
    for (const expData of expenses) {
      const normalizedSupplier = await normalizeSupplier(expData.supplier, tenantId);
      const expense = await Expense.create({
        tenant_id: tenantId,
        ...expData,
        supplier: normalizedSupplier,
        expense_date: expData.expense_date || new Date(),
        status: expData.status || 'unsettled'
      });
      createdExpenses.push(expense);
    }

    res.status(201).json({
      success: true,
      expenses: createdExpenses
    });

  } catch (error) {
    logger.error('Bulk create expense error', { error: error.message, tenantId });
    res.status(500).json({
      success: false,
      message: "Error creating expenses"
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
    logger.error('Get expense summary error', { error: error.message, tenantId });
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
    logger.error('Get all expenses error', { error: error.message, tenantId });
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
    logger.error('Update expense error', { error: error.message, tenantId, expenseId: id });
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
    logger.error('Delete expense error', { error: error.message, tenantId, expenseId: id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
};


exports.settleExpense = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    const settledExpense = await Expense.settle(id, { tenantId });

    if (!settledExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      expense: settledExpense
    });

  } catch (error) {
    logger.error('Settle expense error', { error: error.message, tenantId, expenseId: id });
    res.status(500).json({
      success: false,
      message: 'Failed to settle expense'
    });
  }
};
