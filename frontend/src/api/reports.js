import api from './axios';
export const rawVariance = (params) => api.get('/reports/variance/raw-materials', { params });
export const productVariance = (params) => api.get('/reports/variance/products', { params });
export const profitability = (params) => api.get('/reports/profitability', { params });
export const salesReport = (params) => api.get('/reports/sales', { params });
