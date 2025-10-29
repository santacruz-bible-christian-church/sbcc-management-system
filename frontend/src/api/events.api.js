import apiClient from './client';

export const eventsApi = {
  // Retrieve a paginated list of events with optional filters
  async listEvents({ page = 1, pageSize = 10, filters = {}, search, ordering } = {}) {
    const params = {
      page,
      page_size: pageSize,
      ...filters,
    };

    if (search) params.search = search;
    if (ordering) params.ordering = ordering;

    const response = await apiClient.get('/events/', { params });
    return response.data;
  },

  // Fetch a single event
  async getEvent(eventId) {
    const response = await apiClient.get(`/events/${eventId}/`);
    return response.data;
  },

  // Create a new event
  async createEvent(payload) {
    const response = await apiClient.post('/events/', payload);
    return response.data;
  },

  // Replace an event
  async updateEvent(eventId, payload) {
    const response = await apiClient.put(`/events/${eventId}/`, payload);
    return response.data;
  },

  // Partially update an event
  async patchEvent(eventId, payload) {
    const response = await apiClient.patch(`/events/${eventId}/`, payload);
    return response.data;
  },

  // Delete an event
  async deleteEvent(eventId) {
    await apiClient.delete(`/events/${eventId}/`);
  },

  // Register current authenticated member for an event
  async registerForEvent(eventId) {
    const response = await apiClient.post(`/events/${eventId}/register/`);
    return response.data;
  },

  // Unregister the authenticated member from an event
  async unregisterFromEvent(eventId) {
    await apiClient.delete(`/events/${eventId}/unregister/`);
  },

  // Fetch registrations for an event
  async listEventRegistrations(eventId) {
    const response = await apiClient.get(`/events/${eventId}/registrations/`);
    return response.data;
  },

  // Retrieve the attendance report for an event
  async getAttendanceReport(eventId) {
    const response = await apiClient.get(`/events/${eventId}/attendance_report/`);
    return response.data;
  },

  // Mark a specific registration as attended
  async markRegistrationAttended(registrationId) {
    const response = await apiClient.post(
      `/event-registrations/${registrationId}/mark_attended/`
    );
    return response.data;
  },
};
