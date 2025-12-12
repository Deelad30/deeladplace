import api from './axios';
export const rawVariance = (params) => api.get('/reports/variance/raw-materials', { params });
export const productVariance = (params) => api.get('/reports/variance/products', { params });
export const profitability = (params) => api.get('/reports/profitability', { params });
export const salesReport = (params) => api.get('/reports/sales', { params })

export const salesOverview = (params) => api.get('/reports/sales-overview', { params });
export const salesSummary = (params) => api.get('/reports/sales-summary', { params });
export const topProducts = (params) => api.get('/reports/top-products', { params });
export const paymentSummary = (params) => api.get('/reports/payment-summary', { params });
