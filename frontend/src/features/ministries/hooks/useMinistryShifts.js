import { useState, useEffect, useCallback } from 'react';
import { ministriesApi } from '../../../api/ministries.api';

export const useMinistryShifts = (ministryId) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShifts = useCallback(async () => {
    if (!ministryId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== FETCHING SHIFTS ===');
      console.log('Ministry ID:', ministryId);

      const data = await ministriesApi.listShifts({ ministry: ministryId });
      const shiftsList = Array.isArray(data) ? data : data.results || [];

      console.log('Fetched shifts:', shiftsList.length);
      setShifts(shiftsList);
    } catch (err) {
      console.error('Failed to load shifts:', err);
      setError(err.response?.data?.detail || 'Unable to load shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = useCallback(async (shiftData) => {
    await ministriesApi.createShift(shiftData);
    await fetchShifts();
  }, [fetchShifts]);

  const deleteShift = useCallback(async (shiftId) => {
    await ministriesApi.deleteShift(shiftId);
    await fetchShifts();
  }, [fetchShifts]);

  const assignedShifts = shifts.filter(s => s.assignment_info);
  const unassignedShifts = shifts.filter(s => !s.assignment_info);

  return {
    shifts,
    assignedShifts,
    unassignedShifts,
    loading,
    error,
    refresh: fetchShifts,
    createShift,
    deleteShift
  };
};
