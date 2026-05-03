import axios from './axios';

export const getNotifications = (params = {}) => {
    return axios.get('/notifications', { params });
};

export const markAsRead = (id) => {
    return axios.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
    return axios.patch('/notifications/read-all');
};
