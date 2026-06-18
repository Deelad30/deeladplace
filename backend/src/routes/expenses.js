const express = require('express');
const { createExpense, getExpenseSummary, updateExpense, deleteExpense, getAllExpenses, settleExpense, bulkCreateExpenses } = require('../controllers/expenseController');
const auth = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const { validateExpenseData } = require('../middleware/validation');

const router = express.Router();


router.post('/', auth, requireTenant, validateExpenseData, createExpense);
router.post('/bulk', auth, requireTenant, bulkCreateExpenses);
router.get('/summary', auth, requireTenant, getExpenseSummary);
router.get('/', auth, requireTenant, getAllExpenses);
router.put('/:id', auth, requireTenant, validateExpenseData, updateExpense);
router.delete('/:id', auth, requireTenant, deleteExpense);
router.patch('/:id/settle', auth, requireTenant, settleExpense);

module.exports = router;