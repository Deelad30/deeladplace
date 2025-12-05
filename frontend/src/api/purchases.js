import api from './axios';

export const getPurchases = () => api.get('/purchases');
export const createPurchase = (body) => api.post('/purchases', body);
