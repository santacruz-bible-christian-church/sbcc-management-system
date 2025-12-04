import apiClient from './client';

const RESOURCE = '/inventory/inventory-tracking/';

export const inventoryApi = {
  listItems: async (params = {}) => {
    const response = await apiClient.get(RESOURCE, { params });
    return response.data;
  },

  createItem: async (payload) => {
    const response = await apiClient.post(RESOURCE, payload);
    return response.data;
  },

  updateItem: async (id, payload) => {
    const response = await apiClient.patch(`${RESOURCE}${id}/`, payload);
    return response.data;
  },

  deleteItem: async (id) => {
    await apiClient.delete(`${RESOURCE}${id}/`);
  },

  downloadReport: async () => {
    const response = await apiClient.get(`${RESOURCE}report-pdf/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
