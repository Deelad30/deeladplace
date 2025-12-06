import api from './axios';

export const issueToProductionAPI = (items, reference) => 
  api.post('/inventory/issue-production', { items, reference });

export const recordProductionAPI = (product_id, qty, cost_per_unit, reference) =>
  api.post('/inventory/production', {
    product_id,
    qty,
    cost_per_unit,
    reference
  });
