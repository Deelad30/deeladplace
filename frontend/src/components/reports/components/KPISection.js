// src/components/reports/components/KPISection.js
import React from 'react';

const formatCurrency = (v) => {
  if (v == null) return '₦0';
  return new Intl.NumberFormat('en-NG', { 
    style: 'currency', 
    currency: 'NGN', 
    maximumFractionDigits: 0 
  }).format(Number(v));
};

const KPICard = ({ icon, value, label }) => (
  <div className="kpi-card">
    <div className="kpi-icon" aria-hidden>{icon}</div>
    <div className="kpi-body">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  </div>
);

const KPISection = ({ overview = {} }) => {
  const {
    total_revenue = 0,
    total_commission = 0,
    total_transactions = 0,
    average_order_value = 0
  } = overview;

  const netProfit = total_revenue - total_commission;

  return (
    <div className="kpi-row">
      
      <KPICard
        icon={
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 2v20" stroke="white" strokeWidth="2" />
            <path d="M4 12h16" stroke="white" strokeWidth="2" />
          </svg>
        }
        value={formatCurrency(total_revenue)}
        label="Total Revenue"
      />

      <KPICard
        icon={
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 10h18" stroke="white" strokeWidth="2" />
            <path d="M6 4h12v16H6z" stroke="white" strokeWidth="2" />
          </svg>
        }
        value={formatCurrency(total_commission)}
        label="Total Commission"
      />

      <KPICard
        icon={
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2"/>
            <path d="M6 20c1.5-3 4.5-5 6-5s4.5 2 6 5" stroke="white" strokeWidth="2"/>
          </svg>
        }
        value={total_transactions}
        label="Total Transactions"
      />

      <KPICard
        icon={
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/>
            <path d="M8 12h8" stroke="white" strokeWidth="2"/>
          </svg>
        }
        value={formatCurrency(average_order_value)}
        label="Avg Order Value"
      />

      <KPICard
        icon={
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2"/>
          </svg>
        }
        value={formatCurrency(netProfit)}
        label="Net Profit"
      />

    </div>
  );
};

export default KPISection;
