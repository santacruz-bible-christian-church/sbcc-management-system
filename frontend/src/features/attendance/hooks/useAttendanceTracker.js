import { useState, useCallback, useEffect } from 'react';
import { attendanceApi } from '../../../api/attendance.api';

/**
 * Hook for managing attendance tracker data fetching and saving
 */
export const useAttendanceTracker = (attendanceId) => {
  const [sheet, setSheet] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchAttendanceSheet = useCallback(async () => {
    if (!attendanceId) {
      setError('No attendance sheet ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getSheet(attendanceId);
      setSheet(data);
      setAttendanceRecords(data.attendance_records || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.detail || 'Unable to load attendance sheet');
    } finally {
      setLoading(false);
    }
  }, [attendanceId]);

  useEffect(() => {
    fetchAttendanceSheet();
  }, [fetchAttendanceSheet]);

  // Toggle attendance for single record
  const handleToggleAttendance = useCallback((recordId) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.id === recordId ? { ...record, attended: !record.attended } : record
      )
    );
    setHasChanges(true);
    setSuccessMessage('');
  }, []);

  // Save changes
  const handleSaveChanges = useCallback(async (onReset) => {
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const updates = attendanceRecords.map((record) => ({
        member: record.member,
        attended: record.attended,
      }));

      const response = await attendanceApi.updateAttendances(attendanceId, { attendances: updates });

      if (response && response.sheet) {
        setSheet(response.sheet);
        setAttendanceRecords([...(response.sheet.attendance_records || [])]);
        setHasChanges(false);
        setSuccessMessage(`Successfully updated ${response.updated_count} attendance records!`);
      } else {
        await fetchAttendanceSheet();
        setHasChanges(false);
        setSuccessMessage('Attendance saved successfully!');
      }

      // Callback to reset filters/selections
      if (onReset) onReset();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.detail || err.message || 'Unable to save changes');
    } finally {
      setSaving(false);
    }
  }, [attendanceId, attendanceRecords, fetchAttendanceSheet]);

  return {
    sheet,
    attendanceRecords,
    setAttendanceRecords,
    loading,
    saving,
    error,
    successMessage,
    hasChanges,
    setHasChanges,
    handleToggleAttendance,
    handleSaveChanges,
    refetch: fetchAttendanceSheet,
  };
};

export default useAttendanceTracker;
