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

  // Archive member
  archiveMember: async (id) => {
    const response = await apiClient.post(`/members/${id}/archive/`);
    return response.data;
  },

  // Restore archived member
  restoreMember: async (id) => {
    const response = await apiClient.post(`/members/${id}/restore/`);
    return response.data;
  },

  // Bulk archive members
  bulkArchive: async (ids) => {
    const response = await apiClient.post('/members/bulk_archive/', { ids });
    return response.data;
  },

  // Import CSV
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/members/import_csv/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get upcoming birthdays
  upcomingBirthdays: async (days = 7) => {
    const response = await apiClient.get('/members/upcoming_birthdays/', {
      params: { days },
    });
    return response.data;
  },

  // Get upcoming anniversaries
  upcomingAnniversaries: async (days = 7) => {
    const response = await apiClient.get('/members/upcoming_anniversaries/', {
      params: { days },
    });
    return response.data;
  },
};

export default membersApi;
