import api from './axios';

export const getPlatformStats = () => api.get('stats/');
export const getReserveLedger = () => api.get('reserve/');
export const postReserveEntry = (data) => api.post('reserve/', data);
export const getAuditLogs = () => api.get('audit-log/');
