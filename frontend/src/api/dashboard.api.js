import apiClient from './client';

export const dashboardApi = {
  // Get dashboard stats
  async getStats() {
    const response = await apiClient.get('/dashboard/stats/');
    return response.data;
  },

  // Get recent activities
  async getActivities() {
    const response = await apiClient.get('/dashboard/activities/');
    return response.data;
  },
};