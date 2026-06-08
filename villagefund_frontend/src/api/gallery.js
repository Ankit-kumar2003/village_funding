import api from './axios';

export const getGallery = (params) => api.get('gallery/', { params });
export const uploadToGallery = (data) => api.post('gallery/', data);
export const deleteFromGallery = (id) => api.delete(`gallery/${id}/`);
