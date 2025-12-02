import api from './axios';

// Compute cost for a product
export const computeCost = (productId, body) =>
  api.post(`/costing/compute/${productId}`, body);

// Save standard cost for product
export const standardizeCost = (productId, body) =>
  api.post(`/standard/standardize/${productId}`, body);

// Recompute actual vs standard cost variance
export const recomputeStandard = (productId) =>
  api.get(`/standard/recompute/${productId}`);
