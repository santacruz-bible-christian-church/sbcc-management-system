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
    const response = await apiClient.patch(`/members/${id}/`, data);
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

  // Bulk delete members (new efficient endpoint)
  bulkDelete: async (ids) => {
    // Handle batching if more than 100 IDs (backend limit)
    if (ids.length <= 100) {
      const response = await apiClient.post('/members/bulk_delete/', { ids });
      return response.data;
    }

    // Batch requests for large selections
    let totalDeleted = 0;
    const batchSize = 100;
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const response = await apiClient.post('/members/bulk_delete/', { ids: batch });
      totalDeleted += response.data.deleted_count;
    }
    
    return { deleted_count: totalDeleted };
  },

  // Import CSV
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/members/import-csv/', formData, {
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

  // Export members list as PDF
  exportPDF: async (params = {}) => {
    const response = await apiClient.get('/members/export-pdf/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get member stats (overall counts by status)
  getStats: async () => {
    const response = await apiClient.get('/members/stats/');
    return response.data;
  },
};

export default membersApi;
