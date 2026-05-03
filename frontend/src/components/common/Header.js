
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_MAP } from "../../utils/roles";
import { APP_CONFIG } from "../../utils/constants";
import "../../../src/styles/components/Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChevronDown, faUserCircle, faBell, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { getStockBalance } from "../../api/inventoryLedger";
import { getNotifications, markAsRead } from "../../api/notifications";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BrandingModal from "../modals/BrandingModal";

const Header = ({ onToggleSidebar, isDesktopOpen, toggleDesktop }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [brandingModalOpen, setBrandingModalOpen] = useState(false);
  
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dbNotifications, setDbNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
      // 1. Fetch Real-time Low Stock
      const stockRes = await getStockBalance();
      const lowItems = (stockRes.data.stock || []).filter(i => i.is_low_stock);
      setLowStockCount(lowItems.length);
      setLowStockItems(lowItems);

      // 2. Fetch Stored Notifications (Margin Alerts, etc.)
      const notifyRes = await getNotifications({ unreadOnly: true, limit: 10 });
      if (notifyRes.data.success) {
        setDbNotifications(notifyRes.data.notifications);
        setUnreadCount(notifyRes.data.notifications.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleNotificationClick = async (item, isDbNotify = false) => {
      setNotificationOpen(false);
      
      if (isDbNotify) {
        // Mark as read in background
        try {
          await markAsRead(item.id);
          setDbNotifications(prev => prev.filter(n => n.id !== item.id));
          setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
          console.error("Failed to mark notification as read", e);
        }

        // Navigate based on type
        if (item.type === 'margin_alert') {
          navigate('/reports'); // Could navigate to specific report if we had tabs working with routes
        }
      } else {
        // Low Stock Alert
        navigate('/inventory', { state: { highlightId: item.item_id || item.id } });
      }
  };

  return (
    <>
    <header className="app-header">
      <div className="header-inner">

        <div className="header-left">
          {/* Mobile Sidebar Toggle */}
          <button className="mobile-toggle" onClick={onToggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* Brand */}
          <div className="header-brand">
            <img 
                src="/logo.png" 
                alt="business-logo" 
                className="logo" 
                style={{ maxHeight: '40px', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div className="header-right">
            
            {/* Notification Bell - Restricted to Admin & Manager */}
            {['admin', 'manager'].includes(ROLE_MAP[user?.role_id]) && (
             <div className="notification-wrapper" ref={notificationRef}>
                <div className="user-info notification-trigger" onClick={() => setNotificationOpen(!notificationOpen)}>
                    <div className="icon-wrapper">
                        <FontAwesomeIcon icon={faBell} className="user-avatar" />
                        {lowStockCount + unreadCount > 0 && (
                            <span className="notification-badge">
                                {lowStockCount + unreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Dropdown for Notifications */}
                {notificationOpen && (
                    <div className="notification-dropdown">
                        <h4 className="dropdown-header">
                            Notifications ({lowStockCount + unreadCount})
                        </h4>
                        
                        {lowStockCount + unreadCount === 0 ? (
                            <p className="no-notifications">No new notifications.</p>
                        ) : (
                            <div className="notification-list">
                                {/* Stored Notifications (Margin Alerts) */}
                                {dbNotifications.map(notify => (
                                    <div 
                                        key={`db-${notify.id}`} 
                                        onClick={() => handleNotificationClick(notify, true)}
                                        className="notification-item"
                                        style={{ borderLeft: '3px solid #f59e0b' }} // Yellow/Amber for margin alerts
                                    >
                                        <div className="notification-dot" style={{ background: '#f59e0b' }}></div>
                                        <div>
                                            <strong className="notification-title">{notify.title}</strong>
                                            <div style={{ color: '#475569', marginTop: '4px', lineHeight: '1.4', fontSize: '13px' }}>
                                                {notify.message}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                                {new Date(notify.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Real-time Low Stock Alerts */}
                                {lowStockItems.map(item => (
                                    <div 
                                        key={`stock-${item.id}`} 
                                        onClick={() => handleNotificationClick(item, false)}
                                        className="notification-item"
                                        style={{ borderLeft: '3px solid #ef4444' }} // Red for stock alerts
                                    >
                                        <div className="notification-dot" style={{ background: '#ef4444' }}></div>
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
                <button onClick={() => { setOpen(false); setBrandingModalOpen(true); }}>Branding Settings</button>
                <button onClick={logout}>Logout</button>
                </div>
            )}
            </div>
        </div>

      </div>
    </header>
    <BrandingModal visible={brandingModalOpen} onClose={() => setBrandingModalOpen(false)} />
    </>
  );
};

export default Header;
