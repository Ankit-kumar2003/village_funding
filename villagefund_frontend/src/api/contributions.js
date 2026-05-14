import api from './axios';

export const createContribution = (data) => api.post('contributions/', data);
export const getUserContributions = () => api.get('contributions/');
export const getAllContributions = (params) => api.get('contributions/', { params });
export const approveContribution = (id) => api.post(`contributions/${id}/approve/`);
export const rejectContribution = (id) => api.post(`contributions/${id}/reject/`);
