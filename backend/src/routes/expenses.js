const express = require('express');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { authenticateToken, requireManagerOrAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getExpenses);
router.post('/', requireManagerOrAdmin, createExpense);
router.put('/:id', requireManagerOrAdmin, updateExpense);
router.delete('/:id', requireManagerOrAdmin, deleteExpense);

module.exports = router;