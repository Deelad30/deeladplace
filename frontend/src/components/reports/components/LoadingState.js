// src/components/reports/components/LoadingState.js
import React from 'react';

const LoadingState = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <div className="skeleton" style={{ height: 90, borderRadius: 12 }}></div>
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="skeleton" style={{ height: 220, borderRadius: 12 }}></div>
      <div className="skeleton" style={{ height: 220, borderRadius: 12 }}></div>
    </div>
    <div className="skeleton" style={{ height: 380, borderRadius: 12 }}></div>
  </div>
);

export default LoadingState;
