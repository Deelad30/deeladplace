import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { APP_CONFIG } from "../../utils/constants";
import "../../../src/styles/components/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faUserCircle } from "@fortawesome/free-solid-svg-icons";

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-inner">

        {/* Mobile Sidebar Toggle */}
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>

        {/* Brand */}
        <div style={{ color:"#d91f22" }} className="header-brand">
          <h1>{APP_CONFIG.APP_NAME}</h1>
        </div>

        {/* User Menu */}
        <div className="user-section">
          <div className="user-info" onClick={() => setOpen(!open)}>
            <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
            <span className="username">{user?.user?.name}</span>
            <FontAwesomeIcon icon={faChevronDown} className="icon-chevron" />
          </div>

          {/* Dropdown */}
          {open && (
            <div className="dropdown-menu">
              <button onClick={logout}>Logout</button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
