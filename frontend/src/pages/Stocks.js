import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import IssueToProduction from '../components/stocks/IssueToProduction';
import RecordProduction from '../components/stocks/RecordProduction';
import '../../src/styles/pages/InventoryPage.css';

const Stocks = () => {
  const [activeTab, setActiveTab] = useState('issues-to-production');

  const renderContent = () => {
    switch (activeTab) {
      case 'issues-to-production':
        return <IssueToProduction />;
      case 'record-production':
        return <RecordProduction />;
      default:
        return <IssueToProduction />;
    }
  };

  return (
    <div className="inventory-page">
      <Header />
      <div className="page-content">
        <Sidebar />

        <main className="main-content">

          <div className="content-header">
            <h1>Stocks Movement</h1>
          </div>

          {/* ---- TABS ---- */}
          <div className="inventory-tabs">
            <button
              className={`tab-button ${activeTab === 'issues-to-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues-to-production')}
            >
              Issue Production
            </button>
            <button
              className={`tab-button ${activeTab === 'record-production' ? 'active' : ''}`}
              onClick={() => setActiveTab('record-production')}   
            >
            Record Production
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
