import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import SalesReport from '../components/reports/SalesReport';
import '../../src/styles/pages/ReportsPage.css';

const ReportsPage = () => {
  return (
    <div className="reports-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Reports & Analytics</h1>
          </div>
          <SalesReport />
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;