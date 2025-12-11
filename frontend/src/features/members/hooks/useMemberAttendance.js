import { useState, useEffect, useCallback } from 'react';
import { attendanceApi } from '../../../api/attendance.api';

export const useMemberAttendance = (memberId, enabled = true) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!memberId || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch 90 days of attendance history
      const data = await attendanceApi.getMemberSummary(memberId, 90);
      setAttendanceData(data);
    } catch (err) {
      console.error('Failed to fetch member attendance:', err);
      setError(err.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  }, [memberId, enabled]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return {
    attendanceData,
    loading,
    error,
    refresh: fetchAttendance,
  };
};

export default useMemberAttendance;
