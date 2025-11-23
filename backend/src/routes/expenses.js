const express = require('express');
const { createExpense, getExpenseSummary, updateExpense, deleteExpense, getAllExpenses } = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');
const { validateExpenseData } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateExpenseData, createExpense);
router.get('/summary', getExpenseSummary);
router.get('/', getAllExpenses);
router.put('/:id', validateExpenseData, updateExpense);
router.delete('/:id', deleteExpense);
router.get('/', getAllExpenses);

module.exports = router;