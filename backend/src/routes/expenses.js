const express = require('express');
const { createExpense, getExpenseSummary } = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');
const { validateExpenseData } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken);

router.post('/', validateExpenseData, createExpense);
router.get('/summary', getExpenseSummary);

module.exports = router;