import apiClient from './client';

export const tasksApi = {
  // ========== Tasks CRUD ==========
  listTasks: async ({ filters = {}, search, ordering = '-priority,end_date', page = 1, pageSize = 20 } = {}) => {
    const params = {
      ...filters,
      search,
      ordering,
      page,
      page_size: pageSize,
    };
    const response = await apiClient.get('/tasks/', { params });
    return response.data;
  },

  getTask: async (id) => {
    const response = await apiClient.get(`/tasks/${id}/`);
    return response.data;
  },

  createTask: async (data) => {
    const response = await apiClient.post('/tasks/', data);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await apiClient.patch(`/tasks/${id}/`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/tasks/${id}/`);
  },

  // ========== Task Actions ==========
  updateProgress: async (id, progressPercentage) => {
    const response = await apiClient.post(`/tasks/${id}/update_progress/`, {
      progress_percentage: progressPercentage,
    });
    return response.data;
  },

  markCompleted: async (id) => {
    const response = await apiClient.post(`/tasks/${id}/mark_completed/`);
    return response.data;
  },

  reopenTask: async (id) => {
    const response = await apiClient.post(`/tasks/${id}/reopen/`);
    return response.data;
  },

  cancelTask: async (id) => {
    const response = await apiClient.post(`/tasks/${id}/cancel/`);
    return response.data;
  },

  // ========== Dashboard Endpoints ==========
  getDashboardUpcoming: async ({ days = 7, ministry, assigned_to } = {}) => {
    const params = { days, ministry, assigned_to };
    const response = await apiClient.get('/tasks/dashboard_upcoming/', { params });
    return response.data;
  },

  getDashboardOverdue: async ({ ministry, assigned_to } = {}) => {
    const params = { ministry, assigned_to };
    const response = await apiClient.get('/tasks/dashboard_overdue/', { params });
    return response.data;
  },

  getDashboardInProgress: async ({ ministry, assigned_to } = {}) => {
    const params = { ministry, assigned_to };
    const response = await apiClient.get('/tasks/dashboard_in_progress/', { params });
    return response.data;
  },

  getStatistics: async ({ ministry, assigned_to } = {}) => {
    const params = { ministry, assigned_to };
    const response = await apiClient.get('/tasks/statistics/', { params });
    return response.data;
  },

  getMyTasks: async ({ status } = {}) => {
    const params = { status };
    const response = await apiClient.get('/tasks/my_tasks/', { params });
    return response.data;
  },

  // ========== Comments ==========
  listComments: async (taskId) => {
    const response = await apiClient.get('/tasks/comments/', { params: { task: taskId } });
    return response.data;
  },

  createComment: async (data) => {
    const response = await apiClient.post('/tasks/comments/', data);
    return response.data;
  },

  deleteComment: async (id) => {
    await apiClient.delete(`/tasks/comments/${id}/`);
  },

  // ========== Attachments ==========
  listAttachments: async (taskId) => {
    const response = await apiClient.get('/tasks/attachments/', { params: { task: taskId } });
    return response.data;
  },

  uploadAttachment: async (taskId, file) => {
    const formData = new FormData();
    formData.append('task', taskId);
    formData.append('file', file);

    const response = await apiClient.post('/tasks/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (id) => {
    await apiClient.delete(`/tasks/attachments/${id}/`);
  },
};
