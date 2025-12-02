import api from './axios';
export const recordSale = (body) => api.post('/pos/sale', body);
export const closeShift = () => api.post('/pos/close-shift');
export const listSales = (params) => api.get('/pos/sales', { params });
