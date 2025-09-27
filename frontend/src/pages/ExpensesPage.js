import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ExpenseForm from '../components/expenses/ExpenseForm';
import '../../src/styles/pages/ExpensesPage.css';

const ExpensesPage = () => {
  return (
    <div className="expenses-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Expense Management</h1>
          </div>
          <ExpenseForm />
        </main>
      </div>
    </div>
  );
};

export default ExpensesPage;