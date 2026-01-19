import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
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

  const handleCloseForm = () => setShowForm(false);

  const handleExpenseAdded = () => {
  setRefreshFlag(prev => !prev); // trigger re-fetch in ExpenseList
  setShowForm(false); // close modal
};


  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Expense Management</h1>
            <p className="subtitle">Track and manage your operational expenses</p>
          </div>
          <button className="primary-btn" onClick={handleOpenForm}>
            + Add Expense
          </button>
        </div>

        {/* Tabs */}


        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'list' && (
            <ExpenseList 
              refreshFlag={refreshFlag} 
              onEditExpense={handleEditExpense} 
            />
          )}
        </div>

        {/* ExpenseForm as modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content-premium">
              <button className="close-modal-btn" onClick={handleCloseForm}>
                ✕
              </button>
              <ExpenseForm 
                onClose={handleCloseForm} 
                onSuccess={handleExpenseAdded} 
                editExpense={editExpense} 
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpensesPage;
