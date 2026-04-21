// src/components/reports/components/VendorPerformanceChart.js
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList
} from 'recharts';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

const VendorPerformanceChart = ({ data = [] }) => {
  const normalized = (data || []).map((d, index) => ({
    revenue: Number(d.total_revenue),
    name: d.vendor_name || 'Unknown',
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={normalized}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120} 
            tick={{ fontSize: 12, fontWeight: 500 }}
            tickFormatter={(value) => value && value.length > 18 ? value.substring(0, 18) + '...' : value}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            formatter={(value) => [
              new Intl.NumberFormat('en-NG', { 
                style: 'currency', 
                currency: 'NGN', 
                maximumFractionDigits: 0 
              }).format(value), 
              'Total Sales'
            ]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24}>
            {normalized.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList 
                dataKey="revenue" 
                position="right" 
                formatter={(v) => new Intl.NumberFormat('en-NG', { notation: 'compact', compactDisplay: 'short' }).format(v)}
                style={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-text)' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendorPerformanceChart;
