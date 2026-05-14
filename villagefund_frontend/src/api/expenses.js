import api from './axios';

export const getExpenses = (params) => api.get('expenses/', { params });
export const createExpense = (data) => api.post('expenses/', data);
export const approveExpense = (id) => api.post(`expenses/${id}/approve/`);
