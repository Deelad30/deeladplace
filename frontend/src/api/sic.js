import api from './axios';
export const postRawSic = (body) => api.post('/sic/raw', body);
export const listRawSic = () => api.get('/sic/raw');
export const postProductSic = (body) => api.post('/sic/product', body);
export const listProductSic = () => api.get('/sic/product');

export const getLatestRawSic = () => api.get('/sic/latest-raw');
export const getLatestProductSic = () => api.get('/sic/latest-product');
