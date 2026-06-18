import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import BulkExpenseForm from '../components/expenses/BulkExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import '../../src/styles/pages/ExpensesPage.css';

const ExpensesPage = () => {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleExpenseAdded = () => {
    setRefreshFlag(prev => !prev);
  };

  const handleEditExpense = (expense) => {
    setEditExpense(expense);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditExpense(null);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Record your expense</h1>
            <p className="subtitle">Quickly log your operational expenses for today</p>
          </div>
        </div>

        {/* Bulk Recording Section */}
        <div className="bulk-recording-section">
          <BulkExpenseForm onSuccess={handleExpenseAdded} />
        </div>

        {/* Today's Expenses List */}
        <div className="tab-content">
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px', color: 'var(--color-text-main)' }}>
            Today's Recorded Expenses
          </h2>
          <ExpenseList
            refreshFlag={refreshFlag}
            onEditExpense={handleEditExpense}
            todayOnly={true}
          />
        </div>

        {/* Edit Modal (Still useful for editing today's expenses) */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content-premium">
              <button className="close-modal-btn" onClick={handleCloseEditModal}>
                ✕
              </button>
              <ExpenseForm
                onClose={handleCloseEditModal}
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
