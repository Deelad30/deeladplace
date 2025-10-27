import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'New Sale', icon: '💳', path: '/pos', color: '#22c55e' },
    { label: 'Add Expense', icon: '💰', path: '/expenses', color: '#3b82f6' },
    { label: 'Record Stock', icon: '📦', path: '/inventory', color: '#f59e0b' },
    { label: 'View Reports', icon: '📈', path: '/reports', color: '#8b5cf6' }
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {actions.map(action => (
          <button
            key={action.path}
            className="action-btn"
            onClick={() => navigate(action.path)}
            style={{ borderColor: action.color }}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;