import api from './axios';

// ----- USERS LIST -----
export const getUsers = () => api.get('/users');

// ----- GET SINGLE USER -----
export const getUser = (id) => api.get(`/users/${id}`);

// ----- INVITE USER -----
export const inviteUser = (body) =>
  api.post('/users/invite', body);

// ----- UPDATE USER ROLE -----
export const updateUserRole = (userId, body) =>
  api.put(`/users/${userId}/role`, body);

// ----- UPDATE USER STATUS (active/inactive) -----
export const updateUserStatus = (userId, body) =>
  api.put(`/users/${userId}/status`, body);

// ----- DELETE USER -----
export const deleteUser = (userId) =>
  api.delete(`/users/${userId}`);

// ----- UPDATE PROFILE -----
export const updateProfile = (body) =>
  api.put('/users/profile', body);

// ----- INITIATE PASSWORD RESET (EMAIL) -----
export const requestPasswordReset = (body) =>
  api.post('/auth/password-reset/request', body);

// ----- COMPLETE PASSWORD RESET -----
export const completePasswordReset = (body) =>
  api.post('/auth/password-reset/complete', body);
