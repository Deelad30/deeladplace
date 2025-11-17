import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faCashRegister,
  faStore,
  faBoxOpen,
  faBoxesStacked,
  faWallet,
  faFileLines
} from "@fortawesome/free-solid-svg-icons";
import "../../../src/styles/components/Sidebar.css";

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: faChartLine },
    { path: "/pos", label: "POS", icon: faCashRegister },
    { path: "/vendors", label: "Vendors", icon: faStore },
    { path: "/products", label: "Products", icon: faBoxOpen },
    { path: "/inventory", label: "Inventory", icon: faBoxesStacked },
    { path: "/expenses", label: "Expenses", icon: faWallet },
    { path: "/reports", label: "Reports", icon: faFileLines }
  ];

  return (
    <>
      <div
        className={`mobile-sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? "active" : ""}
                  onClick={closeSidebar}
                >
                  <FontAwesomeIcon icon={item.icon} className="icon animated-icon" />
                  <span className="label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
