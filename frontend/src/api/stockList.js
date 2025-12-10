// src/api/stockList.js
import api from './axios';

export const getStockItems = () => api.get('/stocks');
export const createStockItem = (data) => api.post('/stocks', data);
export const updateStockItem = (id, data) => api.put(`/stocks/${id}`, data);
export const deleteStockItem = (id) => api.delete(`/stocks/${id}`);
export const adjustStockQuantity = (id, adjustment) =>
  api.patch(`/stocks/${id}/adjust`, { adjustment });

