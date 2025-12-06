import api from './axios';

// GET all labour records
export const getLabour = () => api.get('/labour');

// CREATE a labour record
export const createLabour = (body) => api.post('/labour', body);

// UPDATE a labour record
export const updateLabour = (id, body) => api.put(`/labour/${id}`, body);

// DELETE a labour record
export const deleteLabour = (id) => api.delete(`/labour/${id}`);
