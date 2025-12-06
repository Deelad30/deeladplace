import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

import RawMaterialsForm from "../components/inventory/RawMaterialsForm";
import MaterialPurchase from '../components/inventory/MaterialPurchase';
import SICSForm from '../components/inventory/SICSForm';
import StockLevels from '../components/inventory/StockLevels';
import VarianceReport from '../components/inventory/VarianceReport';
import PackagingPage from '../components/inventory/Packaging';

import '../../src/styles/pages/InventoryPage.css';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('raw-materials');

  const renderContent = () => {
    switch (activeTab) {
      case 'raw-materials':
        return <RawMaterialsForm />;
      case 'material-purchase':
        return <MaterialPurchase />;
      case 'packaging' :
        return <PackagingPage />;
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
            <h1>Inventory Management</h1>
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
              className={`tab-button ${activeTab === 'sics-form' ? 'active' : ''}`}
              onClick={() => setActiveTab('sics-form')}
            >
              SICS Form
            </button>

            <button
              className={`tab-button ${activeTab === 'stock-levels' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock-levels')}
            >
              Stock Levels
            </button>

            <button
              className={`tab-button ${activeTab === 'variance-report' ? 'active' : ''}`}
              onClick={() => setActiveTab('variance-report')}
            >
              Variance Report
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

export default InventoryPage;
