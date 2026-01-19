import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLayout } from '../../context/LayoutContext';
const Layout = ({ children }) => {
    const { 
        sidebarOpen, 
        toggleMobile: toggleSidebar,
        closeMobile
    } = useLayout();

    return (
        <div className="app-layout">
            {/* Sidebar (Fixed / Hover) */}
            <Sidebar 
                isOpen={sidebarOpen} 
                closeSidebar={closeMobile} 
            />
            
            {/* Mobile Overlay */}
            <div className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeMobile}></div>

            {/* Main Content Area */}
            <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
                
                {/* Sticky Header */}
                <Header 
                    onToggleSidebar={toggleSidebar} 
                />

                {/* Scrollable Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
