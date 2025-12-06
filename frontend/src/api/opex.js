import api from './axios';

// GET all OPEX items
export const getOpex = () => api.get('/opex');

// CREATE OPEX item
export const createOpex = (body) => api.post('/opex', body);

// UPDATE OPEX item
export const updateOpex = (id, body) => api.put(`/opex/${id}`, body);

// DELETE OPEX item
export const deleteOpex = (id) => api.delete(`/opex/${id}`);
