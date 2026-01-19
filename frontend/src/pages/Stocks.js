import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import IssueToProduction from '../components/stocks/IssueToProduction';
import RecordProduction from '../components/stocks/RecordProduction';
// import StockList from '../components/stocks/StockList'; // Deprecated existing list
import StockLedgerView from '../components/inventory/StockLedgerView';
import '../styles/shared/PremiumShared.css';

const Stocks = () => {
  // Forced Rebuild 
  const [activeTab, setActiveTab] = useState('stocks'); // Default to stocks for visibility

  const renderContent = () => {
    switch (activeTab) {
      case 'issues-to-production':
        return <IssueToProduction />;
      case 'record-production':
        return <RecordProduction />;
      case 'stocks':
        return <StockLedgerView />;
      default:
        return <StockLedgerView />;
    }
  };

  return (
    <Layout>
      <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Stocks Movement</h1>
          </div>

          {/* ---- TABS ---- */}
          <div className="premium-tabs">
            <button
              className={`tab-btn ${activeTab === 'issues-to-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues-to-production')}
            >
              Issue Production
            </button>
            <button
              className={`tab-btn ${activeTab === 'record-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('record-production')}   
            >
            Record Production
            </button>
            <button
              className={`tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('stocks')}   
            >
            Stocks
            </button>
          </div>

          {/* ---- ACTIVE COMPONENT ---- */}
          <div>
            {renderContent()}
          </div>
      </div>
    </Layout>
  );
};

export default Stocks;
