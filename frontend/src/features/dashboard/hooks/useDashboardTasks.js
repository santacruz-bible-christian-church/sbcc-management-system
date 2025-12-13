import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../../../api/tasks.api';

export const useDashboardTasks = () => {
  const [data, setData] = useState({
    upcoming: [],
    overdue: [],
    inProgress: [],
    statistics: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [upcoming, overdue, inProgress, statistics] = await Promise.all([
        tasksApi.getDashboardUpcoming({ days: 7 }),
        tasksApi.getDashboardOverdue(),
        tasksApi.getDashboardInProgress(),
        tasksApi.getStatistics(),
      ]);

      setData({
        upcoming: upcoming.results || upcoming || [],
        overdue: overdue.results || overdue || [],
        inProgress: inProgress.results || inProgress || [],
        statistics,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch tasks');
      console.error('Dashboard tasks error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    ...data,
    loading,
    error,
    refresh: fetchTasks,
  };
};
