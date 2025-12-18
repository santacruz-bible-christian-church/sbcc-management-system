import api from './client';

// ============================================================================
// Visitors CRUD
// ============================================================================

/**
 * Get paginated list of visitors
 * @param {Object} params - Query parameters (page, page_size, search, status, follow_up_status)
 */
export async function getVisitors(params = {}) {
  const response = await api.get('/visitors/', { params });
  return response.data;
}

/**
 * Get single visitor by ID
 * @param {number} id - Visitor ID
 */
export async function getVisitorById(id) {
  const response = await api.get(`/visitors/${id}/`);
  return response.data;
}

/**
 * Create a new visitor
 * @param {Object} data - Visitor data (full_name, phone, email, notes)
 */
export async function createVisitor(data) {
  const response = await api.post('/visitors/', data);
  return response.data;
}

/**
 * Update an existing visitor
 * @param {number} id - Visitor ID
 * @param {Object} data - Updated data
 */
export async function updateVisitor(id, data) {
  const response = await api.patch(`/visitors/${id}/`, data);
  return response.data;
}

/**
 * Delete a visitor
 * @param {number} id - Visitor ID
 */
export async function deleteVisitor(id) {
  const response = await api.delete(`/visitors/${id}/`);
  return response.data;
}

// ============================================================================
// Custom Actions
// ============================================================================

/**
 * Check in a visitor for a service
 * @param {number} id - Visitor ID
 * @param {string} serviceDate - Service date (YYYY-MM-DD format)
 */
export async function checkInVisitor(id, serviceDate) {
  const response = await api.post(`/visitors/${id}/check_in/`, {
    service_date: serviceDate,
  });
  return response.data;
}

/**
 * Convert a visitor to a member
 * @param {number} id - Visitor ID
 * @param {Object} data - Conversion data (date_of_birth required, phone and email optional)
 */
export async function convertVisitorToMember(id, data) {
  const response = await api.post(`/visitors/${id}/convert_to_member/`, data);
  return response.data;
}

/**
 * Update follow-up status for a visitor
 * @param {number} id - Visitor ID
 * @param {string} followUpStatus - New status (visited_1x, visited_2x, regular)
 */
export async function updateFollowUpStatus(id, followUpStatus) {
  const response = await api.patch(`/visitors/${id}/update_follow_up/`, {
    follow_up_status: followUpStatus,
  });
  return response.data;
}

/**
 * Get visitors filtered by follow-up status
 * @param {string} status - Follow-up status to filter by
 */
export async function getVisitorsByFollowUpStatus(status) {
  const response = await api.get('/visitors/by_follow_up_status/', {
    params: { status },
  });
  return response.data;
}

/**
 * Get visitor statistics
 */
export async function getVisitorStatistics() {
  const response = await api.get('/visitors/statistics/');
  return response.data;
}

// ============================================================================
// Visitor Attendance
// ============================================================================

/**
 * Get paginated list of visitor attendance records
 * @param {Object} params - Query parameters
 */
export async function getVisitorAttendance(params = {}) {
  const response = await api.get('/visitors/attendance/', { params });
  return response.data;
}

/**
 * Create a visitor attendance record directly
 * @param {Object} data - Attendance data (visitor, service_date)
 */
export async function createVisitorAttendance(data) {
  const response = await api.post('/visitors/attendance/', data);
  return response.data;
}
