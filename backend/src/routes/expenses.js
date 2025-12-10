const express = require('express');
const { createExpense, getExpenseSummary, updateExpense, deleteExpense, getAllExpenses } = require('../controllers/expenseController');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const { validateExpenseData } = require('../middleware/validation');

const router = express.Router();


router.post('/', auth, requireTenant, validateExpenseData, createExpense);
router.get('/summary', auth, requireTenant, getExpenseSummary);
router.get('/', auth, requireTenant, getAllExpenses);
router.put('/:id', auth, requireTenant, validateExpenseData, updateExpense);
router.delete('/:id', auth, requireTenant, deleteExpense);
router.get('/', auth, requireTenant, getAllExpenses);

module.exports = router;