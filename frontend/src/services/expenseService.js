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

  async getAllExpenses() {
  const response = await api.get('/expenses');
  return response;
}

async updateExpense(id, expenseData) {
  return api.put(`/expenses/${id}`, expenseData);
}

async deleteExpense(id) {
  return api.delete(`/expenses/${id}`);
}


}



export const expenseService = new ExpenseService();