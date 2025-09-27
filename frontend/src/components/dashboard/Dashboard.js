import React, { useState, useEffect } from 'react';
import DashboardCard from '../common/DashboardCard';
import { salesService } from '../../services/salesService';
import { formatCurrency } from '../../utils/formatters';
import '../../../src/styles/components/Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({ today: {}, this_month: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesSummary();
  }, []);

  const fetchSalesSummary = async () => {
    try {
      const response = await salesService.getSalesSummary();
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching sales summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <DashboardCard
          title="Today's Revenue"
          value={summary.today.total_revenue || 0}
          subtitle={`${summary.today.transaction_count || 0} transactions`}
          icon="💰"
          color="#22c55e"
        />
        
        <DashboardCard
          title="Today's Commission"
          value={summary.today.total_commission || 0}
          subtitle="Hub earnings"
          icon="🏪"
          color="#3b82f6"
        />
        
        <DashboardCard
          title="This Month Revenue"
          value={summary.this_month.total_revenue || 0}
          subtitle={`${summary.this_month.transaction_count || 0} transactions`}
          icon="📈"
          color="#f59e0b"
        />
        
        <DashboardCard
          title="This Month Commission"
          value={summary.this_month.total_commission || 0}
          subtitle="Hub earnings"
          icon="💼"
          color="#ef4444"
        />
      </div>
    </div>
  );
};

export default Dashboard;