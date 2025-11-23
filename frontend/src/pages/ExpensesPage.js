import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseReport from '../components/expenses/Expensereport';
import '../../src/styles/pages/ExpensesPage.css';

const ExpensesPage = () => {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [editExpense, setEditExpense] = useState(null); 

  const handleOpenForm = () => {
  setEditExpense(null);
  setShowForm(true);
};

const handleEditExpense = (expense) => {
  setEditExpense(expense); 
  setShowForm(true);
};

  // const handleExpenseAdded = () => {
  //   setRefreshFlag(prev => !prev); // toggle flag to trigger re-fetch
  // };

  const handleCloseForm = () => setShowForm(false);

  const handleExpenseAdded = () => {
  setRefreshFlag(prev => !prev); // trigger re-fetch in ExpenseList
  setShowForm(false); // close modal
};


  return (
    <div className="expenses-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            className="content-header"
          >
            <h1>Expense Management</h1>
            <button className="open-form-btn" onClick={handleOpenForm}>
              + Add Expense
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              All Expenses
            </button>
            <button
              className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
            >
              Expense Report
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
              {activeTab === 'list' && <ExpenseList refreshFlag={refreshFlag} onEditExpense={handleEditExpense} />}
              {activeTab === 'report' && <ExpenseReport refreshFlag={refreshFlag} />}
          </div>

          {/* ExpenseForm as modal */}
          {showForm && (
            <div className="modal-overlay">
              <div style={{ width:"60%!important"}} className="modal-content-this">
                <button className="close-btn" onClick={handleCloseForm}>
                  ✕
                </button>
                 <ExpenseForm onClose={handleCloseForm} onSuccess={handleExpenseAdded}  editExpense={editExpense} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExpensesPage;
