import api from './axios';

export const getUsers = () => api.get('users/');
export const updateUserRole = (id, role) => api.patch(`users/${id}/role/`, { role });
