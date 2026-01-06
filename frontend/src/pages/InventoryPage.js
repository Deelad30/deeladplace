import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SICSForm from '../components/inventory/SICSForm';
import StockList from '../components/stocks/StockList';
import ProductSICPage from '../components/inventory/ProductSIC';
import '../../src/styles/pages/InventoryPage.css';

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

  // ---- CONTENT RENDER ----
  const renderContent = () => {
    if (!allowedTabs.includes(activeTab)) return null;

    switch (activeTab) {
      case 'issues-to-production':
        return <StockList />;
      case 'record-production':
        return <SICSForm />;
      case 'stocks':
        return <ProductSICPage />;
      default:
        return null;
    }
  };

  return (
    <div className="inventory-page">
      <Header />
      <div className="page-content">
        <Sidebar />

        <main className="main-content">
          <div className="content-header">
            <h1>Manage Your Inventory</h1>
          </div>

          {/* ---- TABS ---- */}
          <div className="inventory-tabs">
            {allowedTabs.includes('issues-to-production') && (
              <button
                className={`tab-button ${
                  activeTab === 'issues-to-production' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('issues-to-production')}
              >
                Stocks
              </button>
            )}

            {allowedTabs.includes('record-production') && (
              <button
                className={`tab-button ${
                  activeTab === 'record-production' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('record-production')}
              >
                SIC Raw
              </button>
            )}

            {allowedTabs.includes('stocks') && (
              <button
                className={`tab-button ${
                  activeTab === 'stocks' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('stocks')}
              >
                SIC Product
              </button>
            )}
          </div>

          {/* ---- ACTIVE COMPONENT ---- */}
          <div className="inventory-content">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Stocks;
