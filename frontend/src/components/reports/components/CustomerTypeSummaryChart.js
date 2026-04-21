// src/components/reports/components/CustomerTypeSummaryChart.js
import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';

const COLORS = {
  'Walk-in': '#ff9800',
  'Online': '#2196f3'
};

const FALLBACK_COLORS = ['#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#00bcd4'];

const CustomerTypeSummaryChart = ({ data = {}, auditMode = false }) => {
  const round100 = (num) => Math.round(num / 100) * 100;

  // data is object: { "Walk-in": 120000, "Online": 45000 }
  const entries = Object.entries(data || {}).map(([k, v]) => ({ 
    name: k || 'Unknown', 
    value: Number(auditMode ? v : round100(Number(v))) 
  }));
  const filtered = entries.filter(e => e.value > 0);

  if (filtered.length === 0) {
    return (
      <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
        No customer type data available
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={filtered} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={3}>
            {filtered.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(value)} />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerTypeSummaryChart;
