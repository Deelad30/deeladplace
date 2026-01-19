// src/components/reports/components/VendorProductChart.js
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, LabelList
} from 'recharts';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

const CustomTooltip = ({ active, payload, auditMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const round100 = (num) => Math.round((num || 0) / 100) * 100;
    
    const displayRevenue = auditMode ? data.revenue : round100(data.revenue);

    const formatCurrency = (v) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: auditMode ? 2 : 0
      }).format(Number(v));
    };

    return (
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '12px', 
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: auditMode ? '1px solid var(--color-primary)' : '1px solid #eee'
      }}>
        <p style={{ fontWeight: '700', marginBottom: '8px', fontSize: '0.9rem', color: '#333' }}>{data.name}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
            Quantity: <span style={{ fontWeight: '600', color: '#2196f3' }}>{data.qty.toLocaleString()} units</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
            Total Sales: <span style={{ fontWeight: '600', color: '#4caf50' }}>{formatCurrency(displayRevenue)}</span>
          </p>
        </div>
        {auditMode && (
          <div style={{ marginTop: '8px', paddingTop: '4px', borderTop: '1px solid #eee' }}>
             <small style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase' }}>Exact Mode</small>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const VendorProductChart = ({ data = [], auditMode = false }) => {
  const normalized = (data || [])
    .filter(d => Number(d.total_qty) > 0)
    .map((d, index) => ({
      qty: Number(d.total_qty),
      revenue: Number(d.total_revenue || 0),
      name: d.product_name || `#${d.product_id}`,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div style={{ width: '100%', height: 300 }}>
      {normalized.length === 0 ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
          No product data for this vendor
        </div>
      ) : (
        <ResponsiveContainer>
          <BarChart
            data={normalized}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f3f3" />
            <XAxis type="number" hide />
            <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              content={<CustomTooltip auditMode={auditMode} />}
            />
            <Bar dataKey="qty" radius={[0, 4, 4, 0]} barSize={22}>
              {normalized.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="qty" position="right" style={{ fontSize: 11, fontWeight: '600', fill: '#444' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default VendorProductChart;
