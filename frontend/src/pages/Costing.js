import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

import RawMaterialsForm from "../components/inventory/RawMaterialsForm";
import MaterialPurchase from '../components/inventory/MaterialPurchase';
import SICSForm from '../components/inventory/SICSForm';
import StockLevels from '../components/inventory/StockLevels';
import VarianceReport from '../components/inventory/VarianceReport';
import PackagingPage from '../components/inventory/Packaging';
import LabourPage from '../components/inventory/LabourPage';  
import OpexPage from '../components/inventory/OpexPage';

import '../../src/styles/pages/InventoryPage.css';

const CostingPage = () => {
  const [activeTab, setActiveTab] = useState('raw-materials');

  const renderContent = () => {
    switch (activeTab) {
      case 'raw-materials':
        return <RawMaterialsForm />;
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
        return <SICSForm />;
    }
  };

  return (
    <div className="inventory-page">
      <Header />
      <div className="page-content">
        <Sidebar />

        <main className="main-content">

          <div className="content-header">
            <h1>Manage Your Costs</h1>
          </div>

          {/* ---- TABS ---- */}
          <div className="inventory-tabs">
            <button
              className={`tab-button ${activeTab === 'raw-materials' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw-materials')}
            >
              Raw Materials
            </button>
            <button
              className={`tab-button ${activeTab === 'material-purchase' ? 'active' : ''}`}
              onClick={() => setActiveTab('material-purchase')}   
            >
              Material Purchase
            </button>
              <button
              className={`tab-button ${activeTab === 'packaging' ? 'active' : ''}`}
              onClick={() => setActiveTab('packaging')}   
            >
              Packaging
            </button>
            <button
              className={`tab-button ${activeTab === 'labour' ? 'active' : ''}`}
              onClick={() => setActiveTab('labour')}
            >
              Labour
            </button>
            <button 
              className={`tab-button ${activeTab === 'opex' ? 'active' : ''}`}
              onClick={() => setActiveTab('opex')}
            >
              Operational Expenses
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

export default CostingPage;
