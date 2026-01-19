import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import SICSForm from '../components/inventory/SICSForm';
import StockLedgerView from '../components/inventory/StockLedgerView';
import ProductSICPage from '../components/inventory/ProductSIC';
import '../../src/styles/shared/PremiumShared.css'; // Use Shared Premium Styles

const Stocks = () => {
  const roleId = JSON.parse(localStorage.getItem('user'))?.role_id;

  // ---- ROLE → ALLOWED TABS ----
  const ROLE_TABS = {
    8: ['stocks'],                // SIC Product
    5: ['record-production'],     // SIC Raw
    9: ['record-production'],     // SIC Raw
    default: [
      'issues-to-production',
      'record-production',
      'stocks',
    ],
  };

  const allowedTabs = ROLE_TABS[roleId] || ROLE_TABS.default;

  const [activeTab, setActiveTab] = useState(allowedTabs[0]);

  // ---- FORCE VALID TAB ----
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
     // eslint-disable-next-line
  }, [roleId, activeTab]);

  return (
    <Layout>
      <div className="page-container">
        {/* ---- HEADER ---- */}
        <div className="page-header">
            <h1 className="page-title">Manage Your Inventory</h1>
        </div>

        {/* ---- TABS ---- */}
        <div className="premium-tabs">
            {allowedTabs.includes('issues-to-production') && (
              <button
                className={`tab-btn ${
                  activeTab === 'issues-to-production' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('issues-to-production')}
              >
                Stocks
              </button>
            )}

            {allowedTabs.includes('record-production') && (
              <button
                className={`tab-btn ${
                  activeTab === 'record-production' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('record-production')}
              >
                SIC Raw
              </button>
            )}

            {allowedTabs.includes('stocks') && (
              <button
                className={`tab-btn ${
                  activeTab === 'stocks' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('stocks')}
              >
                SIC Product
              </button>
            )}
        </div>

        {/* ---- ACTIVE COMPONENT ---- */}
        <div> {/* Removed nested inventory-content class to let children handle their own containers/cards */}
            {activeTab === 'issues-to-production' && <StockLedgerView />}
            {activeTab === 'record-production' && <SICSForm />}
            {activeTab === 'stocks' && <ProductSICPage />}
        </div>
      </div>
    </Layout>
  );
};

export default Stocks;
