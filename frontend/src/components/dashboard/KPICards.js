import React from 'react';
import DashboardCard from '../common/DashboardCard';

const KPICards = ({ data }) => {
  return (
    <div className="kpi-cards">
      <DashboardCard
        title="Total Vendors"
        value={data.vendorCount}
        subtitle="Active vendors"
        icon="🏪"
      />
      
      <DashboardCard
        title="Active Products"
        value={data.productCount}
        subtitle="Available items"
        icon="🍕"
      />
      
      <DashboardCard
        title="Daily Average"
        value={data.dailyAverage}
        subtitle="Revenue per day"
        icon="📊"
      />
    </div>
  );
};

export default KPICards;