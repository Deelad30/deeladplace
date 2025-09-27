import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SICSForm from '../components/inventory/SICSForm';
import '../../src/styles/pages/InventoryPage.css';

const InventoryPage = () => {
  return (
    <div className="inventory-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Inventory Management</h1>
          </div>
          <SICSForm />
        </main>
      </div>
    </div>
  );
};

export default InventoryPage;