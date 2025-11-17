import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCashRegister,
  FaMoneyBillWave,
  FaBoxes,
  FaChartLine
} from 'react-icons/fa';
import './QuickActions.css';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Sale', icon: <FaCashRegister />, path: '/pos', color: '#22c55e' },
    { label: 'Expense', icon: <FaMoneyBillWave />, path: '/expenses', color: '#3b82f6' },
    { label: 'Stock', icon: <FaBoxes />, path: '/inventory', color: '#f59e0b' },
    { label: 'Reports', icon: <FaChartLine />, path: '/reports', color: '#8b5cf6' }
  ];

  return (
    <div className="quick-actions-row">
      <h3 className="qa-title-inline">Quick Actions</h3>

      <div className="qa-inline">
        {actions.map(action => (
          <button
            key={action.path}
            className="qa-btn-sm"
            onClick={() => navigate(action.path)}
            style={{ '--accent': action.color }}
          >
            <span className="qa-icon-sm">{action.icon}</span>
            <span className="qa-label-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
