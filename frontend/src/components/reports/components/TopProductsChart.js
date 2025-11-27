// src/components/reports/components/TopProductsChart.js
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

// Simple abbreviation: take first 3 letters of each word
const abbreviateName = (name) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return name.slice(0, 4); // single word, take first 4 letters
  return words.map(w => w.slice(0, 2).toUpperCase()).join(''); // multi-word: take 2 letters each
};

const TopProductsChart = ({ data = [] }) => {
  const normalized = (data || []).map((d, index) => ({
    name: d.product_name || `#${d.product_id}`,
    abbreviated: abbreviateName(d.product_name || `#${d.product_id}`),
    value: Number(d.total_revenue),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={normalized} 
          layout="vertical" 
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }} 
          barCategoryGap="15%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f3f3" />
          <XAxis 
            type="number" 
            tickFormatter={(v) => new Intl.NumberFormat().format(Math.round(v))} 
          />
          <YAxis 
            dataKey="abbreviated" 
            type="category" 
            width={60} // small space for abbreviations
          />
          <Tooltip 
            formatter={(value, name, props) => [
              new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value),
              props.payload.name // full product name on hover
            ]}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            {normalized.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
