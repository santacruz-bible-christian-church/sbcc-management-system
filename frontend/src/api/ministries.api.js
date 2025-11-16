import apiClient from './client';

export const ministriesApi = {
  // Get all ministries with pagination and filters
  listMinistries: (params = {}) =>
    apiClient.get('/ministries/', { params }).then(res => res.data),

  // Get single ministry
  getMinistry: (id) =>
    apiClient.get(`/ministries/${id}/`).then(res => res.data),

  // Create ministry
  createMinistry: (data) =>
    apiClient.post('/ministries/', data).then(res => res.data),

  // Update ministry
  updateMinistry: (id, data) =>
    apiClient.put(`/ministries/${id}/`, data).then(res => res.data),

  // Delete ministry
  deleteMinistry: (id) =>
    apiClient.delete(`/ministries/${id}/`).then(res => res.data),

  // Rotate shifts for a ministry
  rotateShifts: (ministryId, data) =>
    apiClient.post(`/ministries/${ministryId}/rotate_shifts/`, data).then(res => res.data),

  // Ministry Members
  listMembers: (params = {}) =>
    apiClient.get('/ministries/members/', { params }).then(res => res.data),

  createMember: (data) =>
    apiClient.post('/ministries/members/', data).then(res => res.data),

  updateMember: (id, data) =>
    apiClient.put(`/ministries/members/${id}/`, data).then(res => res.data),

  deleteMember: (id) =>
    apiClient.delete(`/ministries/members/${id}/`).then(res => res.data),

  // Shifts
  listShifts: (params = {}) =>
    apiClient.get('/ministries/shifts/', { params }).then(res => res.data),

  createShift: (data) =>
    apiClient.post('/ministries/shifts/', data).then(res => res.data),

  updateShift: (id, data) =>
    apiClient.put(`/ministries/shifts/${id}/`, data).then(res => res.data),

  deleteShift: (id) =>
    apiClient.delete(`/ministries/shifts/${id}/`).then(res => res.data),

  // Assignments
  listAssignments: (params = {}) =>
    apiClient.get('/ministries/assignments/', { params }).then(res => res.data),
};

export default ministriesApi;
