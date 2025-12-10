import apiClient from './client';

export const meetingMinutesApi = {
  // ========== Meeting Minutes CRUD ==========
  list: async ({ category, ministry, search, ordering = '-meeting_date', page = 1, pageSize = 20 } = {}) => {
    const params = {
      category,
      ministry,
      search,
      ordering,
      page,
      page_size: pageSize,
    };
    const response = await apiClient.get('/meeting-minutes/', { params });
    return response.data;
  },

  get: async (id) => {
    const response = await apiClient.get(`/meeting-minutes/${id}/`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/meeting-minutes/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.patch(`/meeting-minutes/${id}/`, data);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/meeting-minutes/${id}/`);
  },

  // ========== Search ==========
  search: async ({ q, category, includeAttachments = false } = {}) => {
    const params = {
      q,
      category,
      include_attachments: includeAttachments,
    };
    const response = await apiClient.get('/meeting-minutes/search/', { params });
    return response.data;
  },

  // ========== Categories ==========
  getCategories: async () => {
    const response = await apiClient.get('/meeting-minutes/categories/');
    return response.data;
  },

  // ========== Versions ==========
  getVersions: async (meetingId) => {
    const response = await apiClient.get(`/meeting-minutes/${meetingId}/versions/`);
    return response.data;
  },

  getVersion: async (meetingId, versionNumber) => {
    const response = await apiClient.get(`/meeting-minutes/${meetingId}/versions/${versionNumber}/`);
    return response.data;
  },

  restoreVersion: async (meetingId, versionNumber) => {
    const response = await apiClient.post(`/meeting-minutes/${meetingId}/versions/${versionNumber}/restore/`);
    return response.data;
  },

  // ========== Attachments ==========
  listAttachments: async (meetingId) => {
    const response = await apiClient.get('/meeting-minutes/attachments/', {
      params: { meeting_minutes: meetingId },
    });
    return response.data;
  },

  uploadAttachment: async (meetingId, file) => {
    const formData = new FormData();
    formData.append('meeting_minutes', meetingId);
    formData.append('file', file);

    const response = await apiClient.post('/meeting-minutes/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (id) => {
    await apiClient.delete(`/meeting-minutes/attachments/${id}/`);
  },
};
