import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import SalesReport from '../components/reports/SalesReport';
import ExpenseReport from '../components/expenses/Expensereport';
import ProductProfit from '../components/reports/components/ProductProfit';
import ExpenseList from '../components/expenses/ExpenseList';
import VarianceReport from '../components/inventory/VarianceReport';
import SICProductReport from '../components/reports/components/SICProductReport';
import SICRawReport from '../components/reports/components/SICRawReport'; 
import '../../src/styles/pages/ReportsPage.css';
import ProductVarianceReport from '../components/inventory/ProductVariance';
import StockBalanceTable from '../components/inventory/StockBalanceTable';
import StockMovementLog from '../components/inventory/StockMovementLog';
import ScrollableTabs from '../components/common/ScrollableTabs';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales'); // default tab

  return (
    <Layout>
          <div className="content-header">
            <h1>Reports & Analytics</h1>
          </div>

          {/* --- Tabs --- */}
          <ScrollableTabs>
            <button
              className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales Report
            </button>

            <button
              className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              Expense Report
            </button>

            <button
              className={`tab-btn ${activeTab === 'variance' ? 'active' : ''}`}
              onClick={() => setActiveTab('variance')}
            >
              Raw Variance Report
            </button>

            <button
              className={`tab-btn ${activeTab === 'product-variance' ? 'active' : ''}`}
              onClick={() => setActiveTab('product-variance')}
            >
              Product Variance Report
            </button>

              <button
              className={`tab-btn ${activeTab === 'product-profit' ? 'active' : ''}`}
              onClick={() => setActiveTab('product-profit')}
            >
              Product Profitability Report
            </button>

              <button
              className={`tab-btn ${activeTab === 'raw-sic' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw-sic')}
            >
              SIC Raw Report
            </button>

             <button
              className={`tab-btn ${activeTab === 'product-sic' ? 'active' : ''}`}
              onClick={() => setActiveTab('product-sic')}
            >
              SIC Product Report
            </button>

            <button
              className={`tab-btn ${activeTab === 'stock-balance' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock-balance')}
            >
              Stock Balance Report
            </button>

            <button
              className={`tab-btn ${activeTab === 'stock-movements' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock-movements')}
            >
              Stock Movements Log
            </button>
          </ScrollableTabs>

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
            {activeTab === 'product-profit' && (
                 <ProductProfit />
            )}
            {activeTab === 'raw-sic' && (
               <SICRawReport />
            )}
            {activeTab === 'product-sic' && (
            <SICProductReport />
            )}
            {activeTab === 'stock-balance' && (
                <div style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px', background: '#e0f2fe', padding: '15px', borderRadius: '10px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd' }}>
                        <strong>Stock Balance Report</strong>: This is a real-time snapshot of your current inventory levels and value.
                    </div>
                   <StockBalanceTable limit={1000} />
                </div>
            )}
            {activeTab === 'stock-movements' && (
                 <div style={{ padding: '20px' }}>
                     <StockMovementLog />
                 </div>
            )}
          </div>
    </Layout>
  );
};

export default ReportsPage;
