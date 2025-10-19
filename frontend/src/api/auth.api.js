import apiClient from './client';

export const authApi = {
  // Login
  async login(username, password) {
    const response = await apiClient.post('/auth/login/', {
      username,
      password,
    });
    return response.data;
  },

  // Logout
  async logout(refreshToken) {
    const response = await apiClient.post('/auth/logout/', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Change password
  async changePassword(oldPassword, newPassword, newPassword2) {
    const response = await apiClient.put('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  },
};