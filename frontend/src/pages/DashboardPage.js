import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Dashboard from '../components/dashboard/Dashboard';
import QuickActions from '../components/dashboard/QuickActions';
import '../../src/styles/pages/DashboardPage.css';

const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Dashboard Overview</h1>
          </div>
          <QuickActions />
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;