import React from 'react';

const ActiveBillsSkeleton = ({ count = 5 }) => {
  return (
    <div className="bills-list">
      <table className="bills-table">
        <thead>
          <tr>
            <th>Table / Bill No</th>
            <th>Staff</th>
            <th>Opened</th>
            <th>Total</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton-base" style={{ height: '16px', width: '60px' }} /></td>
              <td><div className="skeleton-base" style={{ height: '14px', width: '100px' }} /></td>
              <td><div className="skeleton-base" style={{ height: '14px', width: '80px' }} /></td>
              <td><div className="skeleton-base" style={{ height: '16px', width: '90px' }} /></td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                   <div className="skeleton-base" style={{ height: '28px', width: '60px', borderRadius: '6px' }} />
                   <div className="skeleton-base" style={{ height: '28px', width: '60px', borderRadius: '6px' }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveBillsSkeleton;
