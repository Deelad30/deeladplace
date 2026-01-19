// src/components/reports/components/SalesTrendsChart.js
import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const SalesTrendsChart = ({ data = [] }) => {
  // Ensure data flows chronologically (Left to Right)
  // Backend usually returns newest first, so we might need to reverse if it's descending
  // But our previous implementation was explicitly reversing it to "fix" something that ended up backwards.
  // Let's normalize it to ensure it goes from oldest to newest.
  const normalized = [...(data || [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), 
      revenue: Number(d.total_revenue),
      commission: Number(d.total_commission)
    }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart data={normalized} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(v) => new Intl.NumberFormat().format(Math.round(v))}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="top" height={36}/>
          <Area 
            name="Revenue"
            type="monotone" 
            dataKey="revenue" 
            stroke="#2196f3" 
            fillOpacity={1} 
            fill="url(#colorRev)" 
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
          <Area 
            name="Commission"
            type="monotone" 
            dataKey="commission" 
            stroke="#4caf50" 
            fillOpacity={1} 
            fill="url(#colorComm)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesTrendsChart;
