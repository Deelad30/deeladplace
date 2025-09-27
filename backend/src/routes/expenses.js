const express = require('express');
const {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllExpenses);
router.post('/', requireManagerOrAdmin, createExpense);
router.put('/:id', requireManagerOrAdmin, updateExpense);
router.delete('/:id', requireManagerOrAdmin, deleteExpense);

module.exports = router;