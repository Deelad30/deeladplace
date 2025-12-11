// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { ROLE_PERMISSIONS, ROLE_MAP } from "../../utils/roles";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCashRegister,
  faStore,
  faBoxOpen,
  faBoxesStacked,
  faWallet,
  faFileLines,
  faCoins,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import "../../styles/components/Sidebar.css";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Convert role_id → role name
  const role = ROLE_MAP[user.role_id] || "staff";
  const perms = ROLE_PERMISSIONS[role] || {};

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: faChartLine, key: "dashboard" },
    { path: "/users/invite", label: "Users / Invites", icon: faUsers, key: "users" },
    { path: "/vendors", label: "Vendors", icon: faStore, key: "vendors" },
    { path: "/products", label: "Products", icon: faBoxOpen, key: "products" },
    { path: "/costing", label: "Costing", icon: faCoins, key: "costing" },
    { path: "/inventory", label: "Inventory", icon: faBoxesStacked, key: "stock" },
    { path: "/pos", label: "POS", icon: faCashRegister, key: "pos" },
    { path: "/expenses", label: "Expenses", icon: faWallet, key: "expenses" },
    { path: "/reports", label: "Reports", icon: faFileLines, key: "reports" },
    // { path: "/sic/products", label: "SIC Products", icon: faBowlFood, key: "sic_product" },
    // { path: "/sic/raw", label: "SIC Raw Materials", icon: faUtensils, key: "sic_raw" },
    // { path: "/recipe", label: "Recipe", icon: faUtensils, key: "recipes" },
    // { path: "/stocks-movement", label: "Stocks Movement", icon: faSliders, key: "stocks" }
  ];


  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`mobile-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              if (!perms[item.key]) return null; // permission-based visibility

              const isActive = location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={isActive ? "active" : ""}
                    onClick={closeSidebar}
                  >
                    <FontAwesomeIcon icon={item.icon} className="icon animated-icon" />
                    <span className="label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
