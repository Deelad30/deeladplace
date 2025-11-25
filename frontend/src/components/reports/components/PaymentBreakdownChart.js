// src/components/reports/components/PaymentBreakdownChart.js
import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';

// Updated color palette with more variety
const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];

const PaymentBreakdownChart = ({ data = {} }) => {
  // data is object: { cash: 120000, pos: 45000, transfer: 35000 }
  const entries = Object.entries(data || {}).map(([k, v]) => ({ name: k || 'unknown', value: Number(v) }));
  const filtered = entries.filter(e => e.value > 0);
  
  return (
    <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={filtered} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={3}>
            {filtered.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)} />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentBreakdownChart;
