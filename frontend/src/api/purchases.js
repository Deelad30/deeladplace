import api from './axios';

export const getPurchases = () => api.get('/purchases');
export const createPurchase = (body) => api.post('/purchases', body);
export const updatePurchase = (id, body) =>
  api.put(`/purchases/${id}`, body);

export const deletePurchase = (id) =>
  api.delete(`/purchases/${id}`);
