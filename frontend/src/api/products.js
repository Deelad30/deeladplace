import api from './axios';
export const getProducts = () => api.get('/products');
export const getRecipe = (productId) => api.get(`/recipes/${productId}`);
export const saveRecipe = (productId, body) => api.post(`/recipes/${productId}`, body);
export const computeCost = (productId, body) => api.post(`/costing/compute/${productId}`, body);
export const standardize = (productId, body) => api.post(`/standard/standardize/${productId}`, body);
