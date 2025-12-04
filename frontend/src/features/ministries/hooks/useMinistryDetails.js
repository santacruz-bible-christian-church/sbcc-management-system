import { useState, useEffect, useCallback } from 'react';
import { ministriesApi } from '../../../api/ministries.api';

export const useMinistryDetails = (ministryId) => {
  const [ministry, setMinistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMinistry = useCallback(async () => {
    if (!ministryId) {
      setMinistry(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== FETCHING MINISTRY ===');
      console.log('Ministry ID:', ministryId);

      const data = await ministriesApi.getMinistry(ministryId);

      console.log('Fetched ministry:', data);
      setMinistry(data);
    } catch (err) {
      console.error('Failed to load ministry:', err);
      setError(err.response?.data?.detail || 'Failed to load ministry details');
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchMinistry();
  }, [fetchMinistry]);

  const updateMinistry = useCallback(async (data) => {
    await ministriesApi.updateMinistry(ministryId, data);
    await fetchMinistry();
  }, [ministryId, fetchMinistry]);

  const deleteMinistry = useCallback(async () => {
    await ministriesApi.deleteMinistry(ministryId);
  }, [ministryId]);

  const rotateShifts = useCallback(async (rotateData) => {
    const result = await ministriesApi.rotateShifts(ministryId, rotateData);
    await fetchMinistry();
    return result;
  }, [ministryId, fetchMinistry]);

  return {
    ministry,
    loading,
    error,
    refresh: fetchMinistry,
    updateMinistry,
    deleteMinistry,
    rotateShifts
  };
};
