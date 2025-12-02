import api from './axios';

// --- Raw Material Variance ---
export const getRawMaterialVariance = (params) =>
  api.get('/variance/raw', { params });

// --- Product Variance ---
export const getProductVariance = (params) =>
  api.get('/variance/products', { params });

// --- Profitability Report ---
export const getProfitReport = (params) =>
  api.get('/reports/profitability', { params });

// --- Sales Report ---
export const getSalesReport = (params) =>
  api.get('/reports/sales', { params });
