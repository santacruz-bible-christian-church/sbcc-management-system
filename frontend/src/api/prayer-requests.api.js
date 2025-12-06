import api from './client';

// ============================================================================
// Prayer Requests CRUD
// ============================================================================

/**
 * Get paginated list of prayer requests
 * @param {Object} params - Query parameters (page, page_size, search, status, priority, etc.)
 */
export async function getPrayerRequests(params = {}) {
  const response = await api.get('/prayer-requests/requests/', { params });
  return response.data;
}

/**
 * Get single prayer request by ID
 * @param {number} id - Prayer request ID
 */
export async function getPrayerRequestById(id) {
  const response = await api.get(`/prayer-requests/requests/${id}/`);
  return response.data;
}

/**
 * Create a new prayer request (authenticated users)
 * @param {Object} data - Prayer request data
 */
export async function createPrayerRequest(data) {
  const response = await api.post('/prayer-requests/requests/', data);
  return response.data;
}

/**
 * Update an existing prayer request
 * @param {number} id - Prayer request ID
 * @param {Object} data - Updated data
 */
export async function updatePrayerRequest(id, data) {
  const response = await api.patch(`/prayer-requests/requests/${id}/`, data);
  return response.data;
}

/**
 * Delete a prayer request
 * @param {number} id - Prayer request ID
 */
export async function deletePrayerRequest(id) {
  const response = await api.delete(`/prayer-requests/requests/${id}/`);
  return response.data;
}

// ============================================================================
// Custom Actions
// ============================================================================

/**
 * Submit a prayer request (public endpoint - no auth required)
 * @param {Object} data - Prayer request submission data
 */
export async function submitPrayerRequest(data) {
  const response = await api.post('/prayer-requests/requests/submit/', data);
  return response.data;
}

/**
 * Assign a prayer request to a pastor/elder
 * @param {number} id - Prayer request ID
 * @param {number} assignedToId - User ID to assign to
 */
export async function assignPrayerRequest(id, assignedToId) {
  const response = await api.post(`/prayer-requests/requests/${id}/assign/`, {
    assigned_to: assignedToId
  });
  return response.data;
}

/**
 * Add a follow-up to a prayer request
 * @param {number} id - Prayer request ID
 * @param {Object} data - Follow-up data (action_type, notes, is_private, update_status)
 */
export async function addPrayerRequestFollowUp(id, data) {
  const response = await api.post(`/prayer-requests/requests/${id}/add_follow_up/`, data);
  return response.data;
}

/**
 * Mark a prayer request as completed
 * @param {number} id - Prayer request ID
 * @param {string} notes - Optional completion notes
 */
export async function markPrayerRequestCompleted(id, notes = null) {
  const response = await api.post(`/prayer-requests/requests/${id}/mark_completed/`, { notes });
  return response.data;
}

/**
 * Get prayer requests submitted by the current user
 */
export async function getMyPrayerRequests() {
  const response = await api.get('/prayer-requests/requests/my_requests/');
  return response.data;
}

/**
 * Get prayer requests assigned to the current user
 */
export async function getAssignedPrayerRequests() {
  const response = await api.get('/prayer-requests/requests/assigned_to_me/');
  return response.data;
}

/**
 * Get prayer requests pending assignment
 */
export async function getPendingPrayerRequests() {
  const response = await api.get('/prayer-requests/requests/pending_assignment/');
  return response.data;
}

/**
 * Get prayer request statistics
 */
export async function getPrayerRequestStatistics() {
  const response = await api.get('/prayer-requests/requests/statistics/');
  return response.data;
}

/**
 * Download prayer requests as CSV
 * @param {Object} params - Filter parameters
 */
export async function downloadPrayerRequestsCSV(params = {}) {
  const response = await api.get('/prayer-requests/requests/download/', {
    params,
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `prayer_requests_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// Follow-Ups
// ============================================================================

/**
 * Get paginated list of follow-ups
 * @param {Object} params - Query parameters
 */
export async function getPrayerFollowUps(params = {}) {
  const response = await api.get('/prayer-requests/follow-ups/', { params });
  return response.data;
}

/**
 * Create a follow-up directly (alternative to add_follow_up action)
 * @param {Object} data - Follow-up data
 */
export async function createPrayerFollowUp(data) {
  const response = await api.post('/prayer-requests/follow-ups/', data);
  return response.data;
}

/**
 * Get a specific follow-up by ID
 * @param {number} id - Follow-up ID
 */
export async function getPrayerFollowUpById(id) {
  const response = await api.get(`/prayer-requests/follow-ups/${id}/`);
  return response.data;
}

/**
 * Update a follow-up
 * @param {number} id - Follow-up ID
 * @param {Object} data - Updated data
 */
export async function updatePrayerFollowUp(id, data) {
  const response = await api.patch(`/prayer-requests/follow-ups/${id}/`, data);
  return response.data;
}

/**
 * Delete a follow-up
 * @param {number} id - Follow-up ID
 */
export async function deletePrayerFollowUp(id) {
  const response = await api.delete(`/prayer-requests/follow-ups/${id}/`);
  return response.data;
}
