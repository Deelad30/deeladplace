import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../src/styles/components/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/pos', label: 'POS', icon: '💳' },
    { path: '/vendors', label: 'Vendors', icon: '🏪' },
    { path: '/products', label: 'Products', icon: '🍕' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/expenses', label: 'Expenses', icon: '💰' },
    { path: '/reports', label: 'Reports', icon: '📈' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;