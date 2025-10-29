import apiClient from './client';

export const membersApi = {
  // Get all members with filters
  listMembers: async (params = {}) => {
    const response = await apiClient.get('/members/', { params });
    return response.data;
  },

  // Get single member
  getMember: async (id) => {
    const response = await apiClient.get(`/members/${id}/`);
    return response.data;
  },

  // Create member
  createMember: async (data) => {
    const response = await apiClient.post('/members/', data);
    return response.data;
  },

  // Update member
  updateMember: async (id, data) => {
    const response = await apiClient.put(`/members/${id}/`, data);
    return response.data;
  },

  // Delete member
  deleteMember: async (id) => {
    const response = await apiClient.delete(`/members/${id}/`);
    return response.data;
  },
};

export default membersApi;
