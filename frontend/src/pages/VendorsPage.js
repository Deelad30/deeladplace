import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VendorList from '../components/vendors/VendorList';
import '../../src/styles/pages/VendorsPage.css';

const VendorsPage = () => {
  return (
    <div className="vendors-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <VendorList />
        </main>
      </div>
    </div>
  );
};

export default VendorsPage;