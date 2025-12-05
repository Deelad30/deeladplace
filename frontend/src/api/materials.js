import api from './axios';

export const getMaterials = () => api.get('/materials');
export const createMaterial = (body) => api.post('/materials', body);
export const updateMaterial = (id, body) => api.put(`/materials/${id}`, body);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);
