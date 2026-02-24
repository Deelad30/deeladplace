import api from './axios';
export const recordSale = (body) => api.post('/pos/sale', body);
export const closeShift = (data) => api.post('/pos/close-shift', data);
export const openShift = () => api.post('/pos/open-shift');

// Active Bills
export const saveBill = (data) => api.post('/pos/bills', data);
export const getActiveBills = () => api.get('/pos/bills');
export const getBillDetails = (id) => api.get(`/pos/bills/${id}`);
export const settleBill = (id, data) => api.post(`/pos/bills/${id}/settle`, data);
export const voidBill = (id) => api.delete(`/pos/bills/${id}`);
