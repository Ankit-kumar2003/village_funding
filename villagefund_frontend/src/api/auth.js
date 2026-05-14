import api from './axios';

export const register = (data) => api.post('auth/register/', data);
export const login = (data) => api.post('auth/login/', data);
export const googleLogin = (credential) => api.post('auth/google/', { credential });
export const getProfile = () => api.get('auth/me/');
export const getLeaderboard = () => api.get('leaderboard/');
