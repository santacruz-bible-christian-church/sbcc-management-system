import { useState, useEffect, useCallback } from 'react';
import { attendanceApi } from '../../../api/attendance.api';

export const useAbsentMembers = (threshold = 3, days = 30) => {
  const [absentMembers, setAbsentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAbsentMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceApi.checkAbsences({ threshold, days });

      // Sort by consecutive absences (most critical first)
      const sorted = (response.problem_members || []).sort(
        (a, b) => b.consecutive_absences - a.consecutive_absences
      );

      setAbsentMembers(sorted);
    } catch (err) {
      console.error('Failed to fetch absent members:', err);
      setError(err.message || 'Failed to load absent member alerts');
    } finally {
      setLoading(false);
    }
  }, [threshold, days]);

  useEffect(() => {
    fetchAbsentMembers();
  }, [fetchAbsentMembers]);

  return {
    absentMembers,
    loading,
    error,
    refresh: fetchAbsentMembers,
    threshold,
    days,
  };
};

export default useAbsentMembers;
