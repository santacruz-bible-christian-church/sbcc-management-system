import { useCallback, useEffect, useState } from 'react';
import { ministriesApi } from '../api/ministries.api';

export const useMinistries = () => {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMinistries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ministriesApi.listMinistries();
      const results = Array.isArray(data) ? data : data.results ?? [];
      setMinistries(results);
    } catch (err) {
      setMinistries([]);
      setError(err.response?.data?.detail || 'Unable to load ministries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  return {
    ministries,
    loading,
    error,
    refresh: fetchMinistries,
  };
};
