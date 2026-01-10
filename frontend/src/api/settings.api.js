import apiClient from './client';

export const settingsApi = {
  // Get settings (admin only - full data)
  getSettings: () =>
    apiClient.get('/settings/').then(res => res.data),

  // Update settings (admin only)
  updateSettings: (data) =>
    apiClient.patch('/settings/', data).then(res => res.data),

  // Get public settings (no auth required)
  getPublicSettings: () =>
    apiClient.get('/public/settings/').then(res => res.data),

  // Upload image (multipart/form-data)
  uploadImage: (field, file) => {
    const formData = new FormData();
    formData.append(field, file);
    return apiClient.patch('/settings/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Remove image
  removeImage: (field) =>
    apiClient.patch('/settings/', { [field]: null }).then(res => res.data),

  // Team Members API (under /settings/team/)
  getTeamMembers: () =>
    apiClient.get('/settings/team/').then(res => res.data),

  getTeamMember: (id) =>
    apiClient.get(`/settings/team/${id}/`).then(res => res.data),

  createTeamMember: (data) => {
    if (data.photo instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      return apiClient.post('/settings/team/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data);
    }
    return apiClient.post('/settings/team/', data).then(res => res.data);
  },

  updateTeamMember: (id, data) => {
    if (data.photo instanceof File) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      return apiClient.patch(`/settings/team/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(res => res.data);
    }
    return apiClient.patch(`/settings/team/${id}/`, data).then(res => res.data);
  },

  deleteTeamMember: (id) =>
    apiClient.delete(`/settings/team/${id}/`).then(res => res.data),

  // Get public team members (no auth required)
  getPublicTeam: () =>
    apiClient.get('/public/team/').then(res => res.data),
};

export default settingsApi;
