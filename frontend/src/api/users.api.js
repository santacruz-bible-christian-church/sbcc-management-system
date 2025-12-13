import apiClient from './client';

export const usersApi = {
  // Get all users with optional filters
  async getUsers(params = {}) {
    const response = await apiClient.get('/auth/users/', { params });
    return response.data;
  },

  // Get single user by ID
  async getUser(id) {
    const response = await apiClient.get(`/auth/users/${id}/`);
    return response.data;
  },

  // Create new user
  async createUser(data) {
    const response = await apiClient.post('/auth/users/', data);
    return response.data;
  },

  // Update user
  async updateUser(id, data) {
    const response = await apiClient.put(`/auth/users/${id}/`, data);
    return response.data;
  },

  // Partial update user
  async patchUser(id, data) {
    const response = await apiClient.patch(`/auth/users/${id}/`, data);
    return response.data;
  },

  // Delete user
  async deleteUser(id) {
    const response = await apiClient.delete(`/auth/users/${id}/`);
    return response.data;
  },

  // Set user password (Super Admin only)
  async setPassword(id, password) {
    const response = await apiClient.post(`/auth/users/${id}/set_password/`, {
      password,
    });
    return response.data;
  },

  // Toggle user active status
  async toggleActive(id) {
    const response = await apiClient.post(`/auth/users/${id}/toggle_active/`);
    return response.data;
  },
};
