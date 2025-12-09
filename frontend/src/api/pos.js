import api from './axios';
export const recordSale = (body) => api.post('/pos/sale', body);
export const closeShift = (data) => api.post('/pos/close-shift', data);
export const openShift = () => api.post('/pos/open-shift');

