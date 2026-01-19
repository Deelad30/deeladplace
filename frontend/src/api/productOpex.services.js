import axios from './axios';

export const getProductOpex = (productId) => axios.get(`/product-opex/${productId}`);
export const addOpexToProduct = (data) => axios.post('/product-opex', data);
export const updateProductOpex = (id, data) => axios.put(`/product-opex/${id}`, data);
export const deleteProductOpex = (id) => axios.delete(`/product-opex/${id}`);
