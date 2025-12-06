import api from './axios';

// Products
export const getProducts = () => api.get('/products/all');
export const createProduct = (body) => api.post('/products', body);
export const updateProductById = (id, body) => api.put(`/products/${id}`, body);
export const deleteProductById = (id) => api.delete(`/products/${id}`);

// Recipes
export const getRecipe = (productId) => api.get(`/recipes/${productId}`);

// create/add recipe item
export const addRecipeItem = (productId, body) =>
  api.post(`/recipes/${productId}/items`, body);

// Get batch & margin
export const getProductSettings = (productId) => api.get(`/products/${productId}/settings`);

// Save batch & margin
export const saveProductSettings = (productId, data) => api.post(`/products/${productId}/settings`, data);

// update recipe item
export const updateRecipeItem = (itemId, body) =>
  api.put(`/recipes/item/${itemId}`, body);

// delete recipe item
export const deleteRecipeItem = (itemId) =>
  api.delete(`/recipes/item/${itemId}`);

// Costing
export const computeCost = (productId, body) =>
  api.post(`/costing/compute/${productId}`, body);

// Standardize
export const standardize = (productId, body) =>
  api.post(`/standard/standardize/${productId}`, body);
