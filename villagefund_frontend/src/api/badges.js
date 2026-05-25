import api from './axios';

export const getAllBadges = () => api.get('badges/');
export const getUserBadges = () => api.get('user-badges/');
