import api from './axios';
export const listMovements = () => api.get('/inventory/movement');
export const createMovement = (body) => api.post('/inventory/movement', body);
