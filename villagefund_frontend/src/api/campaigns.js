import api from './axios';

export const getCampaigns = (params) => api.get('campaigns/', { params });
export const getCampaignDetail = (id) => api.get(`campaigns/${id}/`);
export const getCampaignUpdates = (id) => api.get(`campaigns/${id}/updates/`);
