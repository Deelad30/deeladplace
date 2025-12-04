import api from './axios';

/** ----- GENERIC INVITE ----- */
export const inviteUser = (email, role_name) =>
  api.post('/invite/invite', { email, role_name });

/** ----- SPECIFIC ROLE INVITES ----- */
export const inviteAdmin = (email) => inviteUser(email, 'admin');
export const inviteManager = (email) => inviteUser(email, 'manager');
export const inviteAccountant = (email) => inviteUser(email, 'accountant');
export const inviteInventoryOfficer = (email) => inviteUser(email, 'inventory_officer');
export const inviteStoreKeeper = (email) => inviteUser(email, 'store_keeper');
export const inviteAuditor = (email) => inviteUser(email, 'auditor');
export const inviteCashier = (email) => inviteUser(email, 'cashier');
export const inviteCashierPlus = (email) => inviteUser(email, 'cashier_plus');
export const inviteKitchenStaff = (email) => inviteUser(email, 'kitchen_staff');

/** ----- GET ALL INVITES ----- */
export const getInvites = () => api.get('/invite/invites');

/** ----- CANCEL INVITE ----- */
export const cancelInvite = (inviteId) =>
  api.delete(`/invite/cancel/${inviteId}`);

/** ----- RESEND INVITE (if needed) ----- */
export const resendInvite = (inviteId) =>
  api.post(`/invite/invite/resend/${inviteId}`);

export const deleteInvite = (inviteId) => api.delete(`/invite/delete/${inviteId}`);