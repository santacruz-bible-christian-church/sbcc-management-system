import api from './client';

export const notificationsApi = {
  getAll: (params = {}) => api.get('/notifications/', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  delete: (id) => api.delete(`/notifications/${id}/`),
};

export default notificationsApi;
