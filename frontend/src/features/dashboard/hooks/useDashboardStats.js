import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../../../api/dashboard.api';

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [chartStats, setChartStats] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await dashboardApi.getStats();
      setStats(data);

      const chartStats = await dashboardApi.getChartsData();
      setChartStats(chartStats);
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  return {
    stats,
    loading,
    chartStats,
    error,
    refreshing,
    refresh,
    retry: fetchStats
  };
};
