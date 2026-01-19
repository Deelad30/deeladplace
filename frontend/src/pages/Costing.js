import React, { useState } from 'react';
import Layout from '../components/common/Layout';

import MaterialPurchase from '../components/inventory/MaterialPurchase';
import SICSForm from '../components/inventory/SICSForm';
import StockLevels from '../components/inventory/StockLevels';
import VarianceReport from '../components/inventory/VarianceReport';
import PackagingPage from '../components/inventory/Packaging';
import LabourPage from '../components/inventory/LabourPage';  
import OpexPage from '../components/inventory/OpexPage';

import '../styles/shared/PremiumShared.css';

const CostingPage = () => {
  const [activeTab, setActiveTab] = useState('material-purchase');

  const renderContent = () => {
    switch (activeTab) {
      case 'material-purchase':
        return <MaterialPurchase />;
      case 'packaging' :
        return <PackagingPage />;
      case 'labour' :
        return <LabourPage />;
      case 'opex' :
        return <OpexPage />;
      case 'sics-form':
        return <SICSForm />;
      case 'stock-levels':
        return <StockLevels />;
      case 'variance-report':
        return <VarianceReport />;
      default:
        return <MaterialPurchase />;
    }
  };

  return (
    <Layout>
      <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Manage Your Costs</h1>
          </div>

          {/* ---- TABS ---- */}
          <div className="premium-tabs">
            <button
              className={`tab-btn ${activeTab === 'material-purchase' ? 'active' : ''}`}
              onClick={() => setActiveTab('material-purchase')}   
            >
              Material Purchase
            </button>
            <button
              className={`tab-btn ${activeTab === 'packaging' ? 'active' : ''}`}
              onClick={() => setActiveTab('packaging')}   
            >
              Packaging
            </button>
            <button
              className={`tab-btn ${activeTab === 'labour' ? 'active' : ''}`}
              onClick={() => setActiveTab('labour')}
            >
              Labour
            </button>
            <button 
              className={`tab-btn ${activeTab === 'opex' ? 'active' : ''}`}
              onClick={() => setActiveTab('opex')}
            >
              Operational Expenses
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

export default CostingPage;
