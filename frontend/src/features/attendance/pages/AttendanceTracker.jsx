import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import { attendanceApi } from '../../../api/attendance.api';

const ACCENT = '#FDB54A';

export default function AttendanceTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const attendanceId = location.state?.attendanceId;

  const [sheet, setSheet] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err.response?.data?.detail || 'Unable to load attendance sheet');
    } finally {
      setLoading(false);
    }
  };

  // Get unique ministries from members
  const ministries = useMemo(() => {
    const ministrySet = new Set();
    attendanceRecords.forEach(record => {
      if (record.member_ministry) {
        ministrySet.add(record.member_ministry);
      }
    });
    return Array.from(ministrySet).sort();
  }, [attendanceRecords]);

  // Filter members
  const filtered = useMemo(() => {
    return attendanceRecords.filter(record => {
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
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.id === recordId
          ? { ...record, attended: !record.attended }
          : record
      )
    );
    setHasChanges(true);
  }, []);

  // Save changes
  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    try {
      const updates = attendanceRecords.map(record => ({
        member: record.member,
        attended: record.attended,
      }));

      await attendanceApi.updateAttendances(attendanceId, { attendances: updates });

      // Refresh data
      await fetchAttendanceSheet();
      setHasChanges(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save changes');
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
      year: 'numeric'
    });
  };

  const getMinistryColor = (ministry) => {
    const colors = {
      'Music Ministry': 'bg-[#D4EFFF] text-[#0092FF]',
      'Media Ministry': 'bg-[#D4FFD9] text-[#00C853]',
      'Worship Ministry': 'bg-[#E8D4FF] text-[#9C27B0]',
      'Youth Ministry': 'bg-[#FFE8D4] text-[#FF9800]',
    };
    return colors[ministry] || 'bg-blue-100 text-blue-600';
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
            <h2 className="text-gray-600 text-sm">Page/Attendance</h2>
            <h1 className="text-3xl font-semibold text-gray-800">Attendance Tracker</h1>
          </div>

          {/* Breadcrumb / back link */}
          <div className="mt-3">
            <Link to="/attendance" className="flex items-center text-sm text-[#FDB54A] font-medium hover:underline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>
                {sheet?.event_title || 'Event'} | {formatDate(sheet?.date)}
              </span>
            </Link>
          </div>

          {/* Stats Summary */}
          {sheet && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-800">{sheet.total_expected || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{sheet.total_attended || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-bold text-[#FDB54A]">
                  {sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          )}

          {/* Controls row */}
          <div className="mt-4 flex items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="pl-3 pr-2">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search members..."
                  className="flex-1 py-2 px-2 outline-none text-sm text-gray-700"
                />
                <button
                  className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium rounded-r-lg"
                  style={{ backgroundColor: ACCENT }}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Ministry filter + Clear */}
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="flex items-center justify-center px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FDB54A]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h8" />
                </svg>
              </div>

              <select
                value={ministryFilter}
                onChange={e => { setMinistryFilter(e.target.value); setPage(1); }}
                className="bg-transparent px-4 py-2 text-sm text-gray-600 outline-none border-0 min-w-[160px]"
              >
                <option value="">All Ministries</option>
                {ministries.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-[#FDB54A] text-white text-sm font-medium rounded-r-lg"
              >
                Clear
              </button>
            </div>

            {/* Save Changes */}
            <div>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || saving}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg shadow-md transition-opacity ${
                  !hasChanges || saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                style={{ backgroundColor: ACCENT }}
              >
                {saving ? 'Saving...' : hasChanges ? 'Save Changes *' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Error message for save failures */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Unsaved changes warning */}
          {hasChanges && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3" role="alert">
              <p className="text-yellow-800 text-sm">
                You have unsaved changes. Click "Save Changes" to update the attendance records.
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Gender</div>
            <div className="col-span-3">Ministry</div>
            <div className="col-span-2 text-right">Attendance</div>
          </div>

          {/* Member rows */}
          {pageItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No members found</p>
            </div>
          ) : (
            pageItems.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4"
                style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
              >
                <div className="col-span-5 text-gray-800 font-medium">
                  {record.member_name || 'Unknown Member'}
                </div>
                <div className="col-span-2 text-gray-600 capitalize">
                  {record.member_gender || 'N/A'}
                </div>
                <div className="col-span-3">
                  {record.member_ministry ? (
                    <span className={`inline-block text-sm px-3 py-1 rounded-full ${getMinistryColor(record.member_ministry)}`}>
                      {record.member_ministry}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">No Ministry</span>
                  )}
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-3">
                  {record.check_in_time && (
                    <span className="text-xs text-gray-500">
                      {new Date(record.check_in_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={record.attended || false}
                    onChange={() => handleToggleAttendance(record.id)}
                    className="w-5 h-5 rounded border-gray-300 text-[#FDB54A] focus:ring-[#FDB54A] cursor-pointer"
                  />
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-center py-6">
              <nav className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <button
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                {Array.from({ length: pageCount }).map((_, idx) => {
                  const num = idx + 1;
                  const active = num === page;
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${
                        active ? 'bg-[#FDB54A] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={{ backgroundColor: active ? ACCENT : undefined }}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={page === pageCount}
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </nav>
            </div>
          )}

          {/* Results info */}
          {filtered.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length} members
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
