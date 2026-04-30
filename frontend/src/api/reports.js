import api from './axios';
export const rawVariance = (params) => api.get('/reports/variance/raw-materials', { params }).then(res => res.data);
export const productVariance = (params) => api.get('/reports/variance/products', { params }).then(res => res.data);
export const profitability = (params) => api.get('/reports/profitability', { params }).then(res => res.data);
export const salesReport = (params) => api.get('/reports/sales', { params }).then(res => res.data);

export const salesOverview = (params) => api.get('/reports/sales-overview', { params }).then(res => res.data);
export const salesSummary = (params) => api.get('/reports/sales-summary', { params }).then(res => res.data);
export const topProducts = (params) => api.get('/reports/top-products', { params }).then(res => res.data);
export const paymentSummary = (params) => api.get('/reports/payment-summary', { params }).then(res => res.data);

export const profitSummary = (params) => api.get('/reports/profit-summary', { params }).then(res => res.data);
export const expenseSummary = (params) => api.get('/reports/expense-summary', { params }).then(res => res.data);
