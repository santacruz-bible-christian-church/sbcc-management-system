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

  // Update current user profile
  async updateProfile(data) {
    const response = await apiClient.patch('/auth/me/', data);
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

  // Forgot password - request reset email
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password/', { email });
    return response.data;
  },

  // Verify reset token is valid
  async verifyResetToken(token) {
    const response = await apiClient.post('/auth/verify-reset-token/', { token });
    return response.data;
  },

  // Reset password with token
  async resetPassword(token, newPassword, newPassword2) {
    const response = await apiClient.post('/auth/reset-password/', {
      token,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  },
};
