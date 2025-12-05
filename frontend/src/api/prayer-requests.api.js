import api from './client';

// Get paginated list of prayer requests
export async function getPrayerRequests(params = {}) {
  const response = await api.get('/prayer-requests/', { params });
  return response.data;
}

// Get single prayer request by ID
export async function getPrayerRequestById(id) {
  const response = await api.get(`/prayer-requests/${id}/`);
  return response.data;
}
