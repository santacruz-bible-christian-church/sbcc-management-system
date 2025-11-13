import apiClient from './client';

export const eventsApi = {
  // ========== Events ==========
  listEvents: async ({ filters = {}, search, ordering = '-date', page = 1, pageSize = 20 } = {}) => {
    const params = {
      ...filters,
      search,
      ordering,
      page,
      page_size: pageSize,
    };
    const response = await apiClient.get('/events/events/', { params });
    return response.data;
  },

  getEvent: async (id) => {
    const response = await apiClient.get(`/events/events/${id}/`);
    return response.data;
  },

  createEvent: async (data) => {
    const response = await apiClient.post('/events/events/', data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await apiClient.patch(`/events/events/${id}/`, data);
    return response.data;
  },

  deleteEvent: async (id) => {
    await apiClient.delete(`/events/events/${id}/`);
  },

  // ========== Event Registrations (RSVP) ==========
  registerForEvent: async (eventId) => {
    const response = await apiClient.post(`/events/events/${eventId}/register/`);
    return response.data;
  },

  unregisterFromEvent: async (eventId) => {
    await apiClient.delete(`/events/events/${eventId}/unregister/`);
  },

  listEventRegistrations: async (eventId) => {
    const response = await apiClient.get(`/events/events/${eventId}/registrations/`);
    return response.data;
  },
};
