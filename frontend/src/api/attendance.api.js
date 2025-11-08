import apiClient from './client';

export const attendanceApi = {
  // Attendance Sheets
  listSheets: async (params = {}) => {
    const response = await apiClient.get('/attendance/sheets/', { params });
    return response.data;
  },

  getSheet: async (id) => {
    const response = await apiClient.get(`/attendance/sheets/${id}/`);
    return response.data;
  },

  createSheet: async (data) => {
    const response = await apiClient.post('/attendance/sheets/', data);
    return response.data;
  },

  updateSheet: async (id, data) => {
    const response = await apiClient.put(`/attendance/sheets/${id}/`, data);
    return response.data;
  },

  deleteSheet: async (id) => {
    const response = await apiClient.delete(`/attendance/sheets/${id}/`);
    return response.data;
  },

  // Bulk update attendances
  updateAttendances: async (id, data) => {
    const response = await apiClient.post(`/attendance/sheets/${id}/update_attendances/`, data);
    return response.data;
  },

  // Mark single member present
  markPresent: async (id, memberId) => {
    const response = await apiClient.post(`/attendance/sheets/${id}/mark_present/`, { member: memberId });
    return response.data;
  },

  // Download CSV
  downloadSheet: async (id) => {
    const response = await apiClient.get(`/attendance/sheets/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Check absences
  checkAbsences: async (params = {}) => {
    const response = await apiClient.get('/attendance/sheets/check_absences/', { params });
    return response.data;
  },

  // Attendance Records
  listRecords: async (params = {}) => {
    const response = await apiClient.get('/attendance/records/', { params });
    return response.data;
  },

  getMemberSummary: async (memberId, days = 90) => {
    const response = await apiClient.get('/attendance/records/member_summary/', {
      params: { member: memberId, days },
    });
    return response.data;
  },

  getMinistryReport: async (ministryId, days = 90) => {
    const response = await apiClient.get('/attendance/records/ministry_report/', {
      params: { ministry: ministryId, days },
    });
    return response.data;
  },
};

export default attendanceApi;
