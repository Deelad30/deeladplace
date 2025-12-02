import api from './axios';

// --- Raw Materials ---
export const getMaterials = () => api.get('/materials');
export const getMaterial = (id) => api.get(`/materials/${id}`);
export const createMaterial = (body) => api.post('/materials', body);
export const updateMaterial = (id, body) => api.put(`/materials/${id}`, body);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

// --- Material Purchases ---
export const getMaterialPurchases = () => api.get('/material-purchases');
export const createMaterialPurchase = (body) =>
  api.post('/material-purchases', body);
