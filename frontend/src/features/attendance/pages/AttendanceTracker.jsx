import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import { attendanceApi } from '../../../api/attendance.api';
import {
  AttendanceStatsCard,
  AttendanceFilterBar,
  AttendanceMemberList,
} from '../components';

export default function AttendanceTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const attendanceId = location.state?.attendanceId;

  const [sheet, setSheet] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [query, setQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  const pageSize = 8;

  // Fetch attendance sheet details
  useEffect(() => {
    if (!attendanceId) {
      setError('No attendance sheet ID provided');
      setLoading(false);
      return;
    }

    fetchAttendanceSheet();
  }, [attendanceId]);

  const fetchAttendanceSheet = async () => {
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
  };

  // Get unique ministries from members
  const ministries = useMemo(() => {
    const ministrySet = new Set();
    attendanceRecords.forEach((record) => {
      if (record.member_ministry) {
        ministrySet.add(record.member_ministry);
      }
    });
    return Array.from(ministrySet).sort();
  }, [attendanceRecords]);

  // Filter members
  const filtered = useMemo(() => {
    return attendanceRecords.filter((record) => {
      // Ministry filter
      if (ministryFilter && record.member_ministry !== ministryFilter) return false;

      // Search filter
      if (query) {
        const searchLower = query.toLowerCase();
        const memberName = record.member_name?.toLowerCase() || '';
        if (!memberName.includes(searchLower)) return false;
      }

      return true;
    });
  }, [query, ministryFilter, attendanceRecords]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handle attendance toggle
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
  const handleSaveChanges = async () => {
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

        // Reset filters and pagination to show all results
        setMinistryFilter('');
        setQuery('');
        setPage(1);

        setSuccessMessage(`Successfully updated ${response.updated_count} attendance records!`);

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        await fetchAttendanceSheet();
        setHasChanges(false);

        setMinistryFilter('');
        setQuery('');
        setPage(1);

        setSuccessMessage('Attendance saved successfully!');

        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || err.message || 'Unable to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setMinistryFilter('');
    setQuery('');
    setPage(1);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="xl" />
            <p className="mt-3 text-gray-500">Loading attendance tracker...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !sheet) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/attendance')}
              className="mt-4 text-[#FDB54A] hover:underline"
            >
              ← Back to Attendance Sheets
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Attendance Tracker</h1>
          </div>

          {/* Breadcrumb / back link */}
          <div className="mt-3">
            <Link
              to="/attendance"
              className="flex items-center text-sm text-[#FDB54A] font-medium hover:underline"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>
                {sheet?.event_title || 'Event'} | {formatDate(sheet?.date)}
              </span>
            </Link>
          </div>

          {/* Stats Summary */}
          {sheet && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <AttendanceStatsCard
                label="Total Members"
                value={sheet.total_expected || 0}
                variant="default"
              />
              <AttendanceStatsCard
                label="Present"
                value={sheet.total_attended || 0}
                variant="success"
              />
              <AttendanceStatsCard
                label="Attendance Rate"
                value={sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : '0%'}
                variant="accent"
              />
            </div>
          )}

          {/* Controls row */}
          <div className="mt-4">
            <AttendanceFilterBar
              query={query}
              onQueryChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
              ministryFilter={ministryFilter}
              onMinistryChange={(value) => {
                setMinistryFilter(value);
                setPage(1);
              }}
              ministries={ministries}
              onClearFilters={handleClearFilters}
              onSave={handleSaveChanges}
              hasChanges={hasChanges}
              saving={saving}
            />
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3" role="alert">
              <p className="text-green-800 text-sm">✓ {successMessage}</p>
            </div>
          )}

          {/* Error message for save failures */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Unsaved changes warning */}
          {hasChanges && !successMessage && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3" role="alert">
              <p className="text-yellow-800 text-sm">
                You have unsaved changes. Click &quot;Save Changes&quot; to update the attendance records.
              </p>
            </div>
          )}
        </div>

        {/* Member List */}
        <AttendanceMemberList
          members={pageItems}
          page={page}
          pageCount={pageCount}
          totalCount={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onToggleAttendance={handleToggleAttendance}
          saving={saving}
        />
      </div>
    </main>
  );
}
