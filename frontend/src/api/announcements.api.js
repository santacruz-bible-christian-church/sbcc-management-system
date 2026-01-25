import apiClient from './client';

export const announcementsApi = {

    list: async (params = {}) => {
        const response = await apiClient.get('/announcements/', { params });
        return response.data.results;
    },

    listPublished: async (ministryId = null) => {
        const params = ministryId ? { ministry: ministryId } : {};
        const response = await apiClient.get('/announcements/published/', { params });
        return response.data;
    },

    get: async (id) => {
        const response = await apiClient.get(`/announcements/${id}/`);
        return response.data;
    },

    create: async (data) => {
        // Set Content-Type header for FormData
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.post('/announcements/', data, config);
        return response.data;
    },

    update: async (id, data) => {
        // Set Content-Type header for FormData
        const config = data instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        const response = await apiClient.patch(`/announcements/${id}/`, data, config);
        return response.data;
    },

    delete: async (id) => {
        const response = await apiClient.delete(`/announcements/${id}/`);
        return response.data;
    },

    sendNow: async (id) => {
        const response = await apiClient.post(`/announcements/${id}/send_now/`);
        return response.data;
    },

    previewRecipients: async (id) => {
        const response = await apiClient.get(`/announcements/${id}/preview_recipients/`);
        return response.data;
    },
};

export default announcementsApi;
