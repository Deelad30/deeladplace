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
  // data is object: { "Walk-in": 50, "Online": 20 }
  const entries = Object.entries(data || {}).map(([k, v]) => ({ 
    name: k || 'Unknown', 
    value: Number(v) 
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
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()} Customers`, 'Count']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerTypeSummaryChart;
