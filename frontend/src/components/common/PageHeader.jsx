import React from 'react';

export default function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      {actionLabel && 
        <button className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      }
    </div>
  );
}
