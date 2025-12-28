import { useCallback, useEffect, useState } from 'react';
import { tasksApi } from '../../../api/tasks.api';

export const useTasks = (options = {}) => {
  const { autoFetch = true } = options;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    ministry: '',
    assigned_to: '',
  });
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-priority,end_date');
  const [statistics, setStatistics] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.listTasks({
        filters,
        search,
        ordering,
        pageSize: 100,
      });
      setTasks(data.results || data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.detail || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters, search, ordering]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await tasksApi.getStatistics({
        ministry: filters.ministry || undefined,
        assigned_to: filters.assigned_to || undefined,
      });
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, [filters.ministry, filters.assigned_to]);

  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
      fetchStatistics();
    }
  }, [autoFetch, fetchTasks, fetchStatistics]);

  const createTask = useCallback(async (data) => {
    const newTask = await tasksApi.createTask(data);
    // Refresh the full list to ensure consistency with server
    await fetchTasks();
    await fetchStatistics();
    return newTask;
  }, [fetchTasks, fetchStatistics]);

  const updateTask = useCallback(async (id, data) => {
    const updated = await tasksApi.updateTask(id, data);
    // Refresh the full list to ensure consistency with server
    await fetchTasks();
    await fetchStatistics();
    return updated;
  }, [fetchTasks, fetchStatistics]);

  const deleteTask = useCallback(async (id) => {
    await tasksApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetchStatistics();
  }, [fetchStatistics]);

  const updateProgress = useCallback(async (id, progress) => {
    const updated = await tasksApi.updateProgress(id, progress);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await fetchStatistics();
    return updated;
  }, [fetchStatistics]);

  const markCompleted = useCallback(async (id) => {
    const updated = await tasksApi.markCompleted(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await fetchStatistics();
    return updated;
  }, [fetchStatistics]);

  const reopenTask = useCallback(async (id) => {
    const updated = await tasksApi.reopenTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await fetchStatistics();
    return updated;
  }, [fetchStatistics]);

  const cancelTask = useCallback(async (id) => {
    const updated = await tasksApi.cancelTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await fetchStatistics();
    return updated;
  }, [fetchStatistics]);

  const resetQuery = useCallback(() => {
    setFilters({ status: '', priority: '', ministry: '', assigned_to: '' });
    setSearch('');
    setOrdering('-priority,end_date');
  }, []);

  const refresh = useCallback(() => {
    fetchTasks();
    fetchStatistics();
  }, [fetchTasks, fetchStatistics]);

  return {
    tasks,
    loading,
    error,
    filters,
    search,
    ordering,
    statistics,
    setFilters,
    setSearch,
    setOrdering,
    resetQuery,
    createTask,
    updateTask,
    deleteTask,
    updateProgress,
    markCompleted,
    reopenTask,
    cancelTask,
    refresh,
  };
};
