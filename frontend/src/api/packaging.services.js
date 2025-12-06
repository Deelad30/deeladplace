import api from './axios';

// Get all packaging items
export const getPackaging = () => api.get('/packaging');

// Create packaging item
export const createPackaging = (body) => api.post('/packaging', body);

// Update packaging item (if you support it)
export const updatePackaging = (id, body) => api.put(`/packaging/${id}`, body);

// Delete packaging item (if you support it)
export const deletePackaging = (id) => api.delete(`/packaging/${id}`);
