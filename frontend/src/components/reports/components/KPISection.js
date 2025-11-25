// src/components/reports/components/KPISection.js
import React from 'react';

const formatCurrency = (v) => {
  if (v == null) return '₦0';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(v));
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
  const { today_revenue = 0, month_revenue = 0, total_transactions_30d = 0, average_order_value_30d = 0, total_commission_30d = 0 } = overview || {};

  return (
    <div className="kpi-row">
      <KPICard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12h16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        value={formatCurrency(month_revenue)}
        label="Revenue (Month)"
      />

      <KPICard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10h18" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M6 4h12v16H6z" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
        value={formatCurrency(total_commission_30d)}
        label="Commission (30d)"
      />

      <KPICard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="white" strokeWidth="2"/><path d="M6 20c1.5-3 4.5-5 6-5s4.5 2 6 5" stroke="white" strokeWidth="2"/></svg>}
        value={total_transactions_30d}
        label="Transactions (30d)"
      />

      <KPICard
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/><path d="M8 12h8" stroke="white" strokeWidth="2"/></svg>}
        value={formatCurrency(average_order_value_30d)}
        label="Avg Order Value (30d)"
      />
    </div>
  );
};

export default KPISection;
