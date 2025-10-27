import api from './api';

class ExpenseService {
  async createExpense(expenseData) {
    const response = await api.post('/expenses', expenseData);
    return response;
  }

  async getExpenseSummary() {
    const response = await api.get('/expenses/summary');
    return response;
  }
}

export const expenseService = new ExpenseService();