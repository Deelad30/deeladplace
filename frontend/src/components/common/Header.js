import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../utils/constants';
import '../../../src/styles/components/Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1>{APP_CONFIG.APP_NAME}</h1>
        </div>
        <div className="header-user">
          <span>Welcome, {user?.user?.name}</span>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;