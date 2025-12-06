import api from './axios';

// Get packaging mapped to a specific product
export const getProductPackaging = (productId) =>
  api.get(`/packaging-map/${productId}`);

// Add packaging to product
export const addPackagingToProduct = (body) =>
  api.post('/packaging-map', body);

// Delete packaging mapping for a product (optional)
export const deleteProductPackaging = (mappingId) =>
  api.delete(`/packaging-map/${mappingId}`);

// Delete packaging mapping for a product (optional)
export const updateProductPackaging = (mappingId, body) =>
  api.put(`/packaging-map/${mappingId}`, body);


