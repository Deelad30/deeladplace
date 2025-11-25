// src/components/reports/components/RevenueChart.js
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// Color gradient options
const GRADIENTS = [
  { start: '#4caf50', end: '#4caf5020' },
  { start: '#2196f3', end: '#2196f320' },
  { start: '#ff9800', end: '#ff980020' },
  { start: '#9c27b0', end: '#9c27b020' },
  { start: '#00bcd4', end: '#00bcd420' },
];

const RevenueChart = ({ data = [] }) => {
  // Pick a random gradient each render
  const gradient = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

  const normalized = [...(data || [])].reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), // e.g., 17 Nov
    revenue: Number(d.total_revenue)
  }));

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={normalized}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient.start} stopOpacity={0.25}/>
              <stop offset="100%" stopColor={gradient.end} stopOpacity={0.05}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => new Intl.NumberFormat().format(Math.round(v))} />
          <Tooltip 
            formatter={(value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)} 
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke={gradient.start} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
