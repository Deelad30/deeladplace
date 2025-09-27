import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const value = {
    vendors,
    setVendors,
    products,
    setProducts,
    sales,
    setSales,
    selectedVendor,
    setSelectedVendor
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};