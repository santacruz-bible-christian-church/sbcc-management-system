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
};

export default settingsApi;
