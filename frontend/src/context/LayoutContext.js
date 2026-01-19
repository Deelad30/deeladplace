import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export const LayoutProvider = ({ children }) => {
  // Desktop Sidebar State - Defaults to TRUE (Open)
  // Persisting state across pages
  const [desktopOpen, setDesktopOpen] = useState(true);

  // Mobile Sidebar State - Defaults to FALSE (Closed)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDesktop = () => setDesktopOpen((prev) => !prev);
  const toggleMobile = () => setSidebarOpen((prev) => !prev);
  const closeMobile = () => setSidebarOpen(false);

  // Close both (for navigation from sidebar links)
  // If user clicks a link, we want to auto-close the sidebar if that's the desired behavior.
  // The user said: "whenever i click... it just disappear on it's own".
  // This implies even on desktop it should close?
  // "and an eye icon to make it slide back". 
  // Yes, they want it to auto-close on navigation.
  const closeSidebar = () => {
    setSidebarOpen(false);
    setDesktopOpen(false);
  };

  const value = {
    desktopOpen,
    setDesktopOpen,
    sidebarOpen,
    setSidebarOpen,
    toggleDesktop,
    toggleMobile,
    closeMobile,
    closeSidebar
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
