import apiClient from './client';

export const ministriesApi = {
  // Get all ministries with pagination and filters
  listMinistries: async (params = {}) => {
    const response = await apiClient.get('/ministries/', { params });
    return response.data;
  },

  // Get single ministry
  getMinistry: async (id) => {
    const response = await apiClient.get(`/ministries/${id}/`);
    return response.data;
  },

  // Create ministry
  createMinistry: async (data) => {
    const response = await apiClient.post('/ministries/', data);
    return response.data;
  },

  // Update ministry
  updateMinistry: async (id, data) => {
    const response = await apiClient.put(`/ministries/${id}/`, data);
    return response.data;
  },

  // Delete ministry
  deleteMinistry: async (id) => {
    const response = await apiClient.delete(`/ministries/${id}/`);
    return response.data;
  },

  // Rotate shifts for a ministry
  rotateShifts: async (id, data) => {
    const response = await apiClient.post(`/ministries/${id}/rotate_shifts/`, data);
    return response.data;
  },

  // Ministry Members
  listMembers: async (params = {}) => {
    const response = await apiClient.get('/ministries/members/', { params });
    return response.data;
  },

  createMember: async (data) => {
    const response = await apiClient.post('/ministries/members/', data);
    return response.data;
  },

  updateMember: async (id, data) => {
    const response = await apiClient.put(`/ministries/members/${id}/`, data);
    return response.data;
  },

  deleteMember: async (id) => {
    const response = await apiClient.delete(`/ministries/members/${id}/`);
    return response.data;
  },

  // Shifts
  listShifts: async (params = {}) => {
    const response = await apiClient.get('/ministries/shifts/', { params });
    return response.data;
  },

  createShift: async (data) => {
    const response = await apiClient.post('/ministries/shifts/', data);
    return response.data;
  },

  updateShift: async (id, data) => {
    const response = await apiClient.put(`/ministries/shifts/${id}/`, data);
    return response.data;
  },

  deleteShift: async (id) => {
    const response = await apiClient.delete(`/ministries/shifts/${id}/`);
    return response.data;
  },

  // Assignments
  listAssignments: async (params = {}) => {
    const response = await apiClient.get('/ministries/assignments/', { params });
    return response.data;
  },
};

export default ministriesApi;
