import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SalesReport from '../components/reports/SalesReport';
import ExpenseReport from '../components/expenses/Expensereport';
import ExpenseList from '../components/expenses/ExpenseList';
import VarianceReport from '../components/inventory/VarianceReport';
import '../../src/styles/pages/ReportsPage.css';
import ProductVarianceReport from '../components/inventory/ProductVariance';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales'); // default tab

  return (
    <div className="reports-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Reports & Analytics</h1>
          </div>

          {/* --- Tabs --- */}
          <div className="report-tabs">
            <button
              className={`report-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales Report
            </button>

            <button
              className={`report-tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              Expense Report
            </button>

            <button
              className={`report-tab-btn ${activeTab === 'variance' ? 'active' : ''}`}
              onClick={() => setActiveTab('variance')}
            >
              Raw Variance Report
            </button>

            <button
              className={`report-tab-btn ${activeTab === 'product-variance' ? 'active' : ''}`}
              onClick={() => setActiveTab('product-variance')}
            >
              Product Variance Report
            </button>
          </div>

          {/* --- Tab Content --- */}
          <div className="report-content">
            {activeTab === 'sales' && <SalesReport />}
            {activeTab === 'expense' && 
                <>
                  <ExpenseReport />
                  <ExpenseList hideActions={true}  />
               </>
            }
            {activeTab === 'variance' && (
                 <VarianceReport />
            )}
            {activeTab === 'product-variance' && (
                 <ProductVarianceReport />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
