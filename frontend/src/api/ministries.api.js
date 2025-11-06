import apiClient from './client';

export const ministriesApi = {
  // Get all ministries
  listMinistries: async (params = {}) => {
    const response = await apiClient.get('/ministries/', { params });
    return response.data;
  },

  // Get single ministry
  getMinistry: async (id) => {
    const response = await apiClient.get(`/ministries/${id}/`);
    return response.data;
  },
};

export default ministriesApi;
