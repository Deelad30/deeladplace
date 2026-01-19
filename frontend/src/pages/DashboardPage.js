import React from 'react';
import Layout from '../components/common/Layout';
import Dashboard from '../components/dashboard/Dashboard';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import ActionGrid from '../components/dashboard/ActionGrid';
import '../../src/styles/pages/DashboardPage.css';

const DashboardPage = () => {
  return (
    <Layout>
      <WelcomeBanner />
      
      <div className="dashboard-section">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '16px' }}>Overview</h3>
        <Dashboard />
      </div>

      <div className="dashboard-section">
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-main)', marginBottom: '16px' }}>Quick Actions</h3>
        <ActionGrid />
      </div>
    </Layout>
  );
};

export default DashboardPage;