import api from './axios';

export const getGallery = (params) => api.get('gallery/', { params });
export const uploadToGallery = (formData) => api.post('gallery/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const deleteFromGallery = (id) => api.delete(`gallery/${id}/`);
