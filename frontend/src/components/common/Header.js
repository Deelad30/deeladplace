
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_MAP } from "../../utils/roles";
import { APP_CONFIG } from "../../utils/constants";
import "../../../src/styles/components/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faUserCircle, faBell, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getStockBalance } from "../../api/inventoryLedger";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar, isDesktopOpen, toggleDesktop }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute

    // Click outside listener
    function handleClickOutside(event) {
        if (notificationRef.current && !notificationRef.current.contains(event.target)) {
            setNotificationOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        clearInterval(interval);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkNotifications = async () => {
    try {
      const res = await getStockBalance();
      const lowItems = (res.data.stock || []).filter(i => i.is_low_stock);
      setLowStockCount(lowItems.length);
      setLowStockItems(lowItems);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleNotificationClick = (item) => {
      setNotificationOpen(false);
      // Navigate to inventory with highlight state
      navigate('/inventory', { state: { highlightId: item.item_id || item.id } }); // Ensure we have the correct ID
  };

  return (
    <header className="app-header">
      <div className="header-inner">

        <div className="header-left">
          {/* Mobile Sidebar Toggle */}
          <button className="mobile-toggle" onClick={onToggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* Brand */}
          <div className="header-brand">
            <img src="/logo.png" alt="logo-deesoftwork" className="logo" />
          </div>
        </div>

        <div className="header-right">
            
            {/* Notification Bell - Restricted to Admin & Manager */}
            {['admin', 'manager'].includes(ROLE_MAP[user?.role_id]) && (
             <div className="notification-wrapper" ref={notificationRef}>
                <div className="user-info notification-trigger" onClick={() => setNotificationOpen(!notificationOpen)}>
                    <div className="icon-wrapper">
                        <FontAwesomeIcon icon={faBell} className="user-avatar" />
                        {lowStockCount > 0 && (
                            <span className="notification-badge">
                                {lowStockCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Dropdown for Notifications */}
                {notificationOpen && (
                    <div className="notification-dropdown">
                        <h4 className="dropdown-header">
                            Notifications ({lowStockCount})
                        </h4>
                        
                        {lowStockCount === 0 ? (
                            <p className="no-notifications">No new notifications.</p>
                        ) : (
                            <div className="notification-list">

                                {lowStockItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleNotificationClick(item)}
                                        className="notification-item"
                                    >
                                        <div className="notification-dot"></div>
                                        <div>
                                            <strong className="notification-title">Low Stock Alert</strong>

                                            <div style={{ color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                                                <span style={{ fontWeight: '600' }}>{item.name}</span> is down to <span style={{ fontWeight: '700' }}>{Number(item.current_stock).toFixed(2)} {item.measurement_unit}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Tap to view details</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div style={{ 
                            borderTop: '1px solid #f1f5f9', 
                            paddingTop: '10px', 
                            marginTop: '5px',
                            textAlign: 'center'
                        }}>
                             <span 
                                onClick={() => { setNotificationOpen(false); navigate('/inventory'); }}
                                style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', cursor: 'pointer' }}
                             >
                                View Full Inventory
                             </span>
                        </div>
                    </div>
                )}
             </div>
            )}

            {/* User Menu */}
            <div className="user-section">
            <div className="user-info" onClick={() => setOpen(!open)}>
                <FontAwesomeIcon icon={faUserCircle} className="user-avatar" />
                <span className="username">{user?.name}</span>
                <FontAwesomeIcon icon={faChevronDown} className="icon-chevron" />
            </div>

            {/* Dropdown */}
            {open && (
                <div className="dropdown-menu">
                <span className="username">{user?.name}</span>
                <button onClick={logout}>Logout</button>
                </div>
            )}
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
