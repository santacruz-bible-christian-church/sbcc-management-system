import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import { attendanceApi } from '../../../api/attendance.api';
import {
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

  // Multi-select state
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

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

  // Multi-select helpers
  const pageItemIds = useMemo(() => new Set(pageItems.map(r => r.id)), [pageItems]);
  const isAllPageSelected = pageItems.length > 0 && pageItems.every(r => selectedRecords.has(r.id));
  const isSomePageSelected = pageItems.some(r => selectedRecords.has(r.id)) && !isAllPageSelected;

  // Toggle multi-select mode
  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedRecords(new Set());
  };

  // Select/deselect individual record
  const toggleRecordSelection = useCallback((recordId) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Select/deselect all on current page
  const toggleAllPageSelection = useCallback(() => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);

      if (isAllPageSelected) {
        // Deselect all on current page
        pageItems.forEach(record => newSet.delete(record.id));
      } else {
        // Select all on current page
        pageItems.forEach(record => newSet.add(record.id));
      }

      return newSet;
    });
  }, [pageItems, isAllPageSelected]);

  // Bulk actions
  const handleBulkMarkPresent = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: true } : record
      )
    );
    setHasChanges(true);
    setSuccessMessage('');
    setSelectedRecords(new Set());
  }, [selectedRecords]);

  const handleBulkMarkAbsent = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: false } : record
      )
    );
    setHasChanges(true);
    setSuccessMessage('');
    setSelectedRecords(new Set());
  }, [selectedRecords]);

  const handleBulkToggle = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: !record.attended } : record
      )
    );
    setHasChanges(true);
    setSuccessMessage('');
    setSelectedRecords(new Set());
  }, [selectedRecords]);

  // Handle attendance toggle (single click)
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
        setSelectedRecords(new Set());
        setIsMultiSelectMode(false);

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
        setSelectedRecords(new Set());
        setIsMultiSelectMode(false);

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
          {/* Back navigation */}
          <Link
            to="/attendance"
            className="inline-flex items-center text-sm text-[#FDB54A] font-medium hover:underline mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Attendance Sheets
          </Link>

          {/* Event info + Stats combined */}
          {sheet && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {sheet.event_title || 'Event'}
                    </h2>
                    <p className="text-sm text-gray-500">{formatDate(sheet.date)}</p>
                  </div>
                  <button
                    onClick={toggleMultiSelectMode}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isMultiSelectMode
                        ? 'bg-[#FDB54A] text-white hover:bg-[#e5a43d]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isMultiSelectMode ? '✓ Multi-Select' : 'Select'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{sheet.total_expected || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Members</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{sheet.total_attended || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Present</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-[#FDB54A]">{sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : '0%'}</p>
                  <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {isMultiSelectMode && selectedRecords.size > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-900">
                  {selectedRecords.size} {selectedRecords.size === 1 ? 'member' : 'members'} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkMarkPresent}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark Present
                  </button>
                  <button
                    onClick={handleBulkMarkAbsent}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Mark Absent
                  </button>
                  <button
                    onClick={handleBulkToggle}
                    className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => setSelectedRecords(new Set())}
                    className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
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

        {/* Member List with saving overlay */}
        <div className={`relative ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
              </div>
            </div>
          )}
          <AttendanceMemberList
            members={pageItems}
            page={page}
            pageCount={pageCount}
            totalCount={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onToggleAttendance={handleToggleAttendance}
            saving={saving}
            isMultiSelectMode={isMultiSelectMode}
            selectedRecords={selectedRecords}
            onToggleSelection={toggleRecordSelection}
            isAllPageSelected={isAllPageSelected}
            isSomePageSelected={isSomePageSelected}
            onToggleAllPage={toggleAllPageSelection}
          />
        </div>
      </div>
    </main>
  );
}
