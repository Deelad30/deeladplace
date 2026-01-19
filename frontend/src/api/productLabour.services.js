import axios from './axios';

export const getProductLabour = (productId) => axios.get(`/product-labour/${productId}`);
export const addLabourToProduct = (data) => axios.post('/product-labour', data);
export const updateProductLabour = (id, data) => axios.put(`/product-labour/${id}`, data);
export const deleteProductLabour = (id) => axios.delete(`/product-labour/${id}`);
