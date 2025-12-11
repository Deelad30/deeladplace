import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SICSForm from '../components/inventory/SICSForm';
import StockList from '../components/stocks/StockList'
import ProductSICPage from '../components/inventory/ProductSIC';
import '../../src/styles/pages/InventoryPage.css';

const Stocks = () => {
  const [activeTab, setActiveTab] = useState('issues-to-production');

  const renderContent = () => {
    switch (activeTab) {
      case 'issues-to-production':
        return <StockList />;
      case 'record-production':
        return <SICSForm />;
      case 'stocks':
        return <ProductSICPage />;
      default:
        return <StockList />;
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
            <button
              className={`tab-button ${activeTab === 'issues-to-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues-to-production')}
            >
              Stocks
            </button>
            <button
              className={`tab-button ${activeTab === 'record-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('record-production')}   
            >
            SIC Raw
            </button>
            <button
              className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('stocks')}   
            >
             SIC Product
            </button>
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
