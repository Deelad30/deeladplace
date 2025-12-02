import api from './axios';
export const listMaterialPurchases = () => api.get('/purchases/material');
export const createMaterialPurchase = (body) => api.post('/purchases/material', body);
