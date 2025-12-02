import api from './axios';

// ----- GET CURRENT TENANT -----
export const getTenant = () => api.get('/tenants/current');

// ----- UPDATE TENANT INFO (name, logo, etc.) -----
export const updateTenant = (body) =>
  api.put('/tenants/current', body);

// ----- CREATE TENANT DURING SIGNUP -----
export const createTenant = (body) =>
  api.post('/tenants', body);

// ----- UPDATE SUBSCRIPTION -----
export const updateSubscription = (body) =>
  api.put('/tenants/subscription', body);

// ----- SWITCH TENANT (if account owns multiple) -----
export const switchTenant = (id) =>
  api.post(`/tenants/switch/${id}`);
