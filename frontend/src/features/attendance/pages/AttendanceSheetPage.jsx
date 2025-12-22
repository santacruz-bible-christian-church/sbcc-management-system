import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendanceSheets } from '../hooks/useAttendanceSheets';
import {
  AttendanceSheetInput,
  AttendanceSheetList,
  AttendanceSheetSkeleton,
  AttendanceToolbar,
} from '../components';
import { Pagination, EmptyState, ConfirmationModal } from '../../../components/ui';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { attendanceApi } from '../../../api/attendance.api';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

export default function AttendanceSheetPage() {
  const navigate = useNavigate();
  const {
    sheets,
    loading,
    error,
    pagination,
    setSearch,
    setFilters,
    filters,
    goToPage,
    createSheet,
    deleteSheet,
    downloadSheet,
  } = useAttendanceSheets();

  const [showModal, setShowModal] = useState(false);
  const [deleteState, setDeleteState] = useState({ open: false, sheet: null });
  const [searchTerm, setSearchTerm] = useState('');

  // Stats state
  const [stats, setStats] = useState({
    total_sheets: 0,
    this_month: 0,
    total_records: 0,
    average_attendance_rate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await attendanceApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, sheets]);

  // Events for filter (could come from an events API)
  const [events, setEvents] = useState([]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setSearch(value);
  }, [setSearch]);

  const handleEventFilterChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, event: value }));
  }, [setFilters]);

  const handleCreate = useCallback(async (data) => {
    try {
      if (!data.eventId || !data.date) {
        console.error('Missing required fields:', data);
        return;
      }

      const dateParts = data.date.split('/');
      if (dateParts.length !== 3) {
        console.error('Invalid date format:', data.date);
        return;
      }

      const formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;

      await createSheet({
        event: data.eventId,
        date: formattedDate,
        notes: data.notes || '',
      });
      setShowModal(false);
      fetchStats(); // Refresh stats after create
    } catch (err) {
      console.error('Create sheet error:', err);
    }
  }, [createSheet, fetchStats]);

  const handleDownload = useCallback(async (sheet) => {
    try {
      await downloadSheet(sheet.id);
    } catch (err) {
      console.error('Download error:', err);
    }
  }, [downloadSheet]);

  const handleEdit = useCallback((sheet) => {
    navigate('/attendance/tracker', { state: { attendanceId: sheet.id } });
  }, [navigate]);

  const openDeleteModal = useCallback((sheet) => {
    setDeleteState({ open: true, sheet });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, sheet: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.sheet) return;
    try {
      await deleteSheet(deleteState.sheet.id);
      closeDeleteModal();
      fetchStats(); // Refresh stats after delete
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [deleteState.sheet, deleteSheet, closeDeleteModal, fetchStats]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Toolbar */}
        <AttendanceToolbar
          stats={stats}
          statsLoading={statsLoading}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          eventFilter={filters.event}
          onEventFilterChange={handleEventFilterChange}
          events={events}
          onCreateClick={() => setShowModal(true)}
        />

        {/* Create Modal */}
        <AttendanceSheetInput
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6" role="alert">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="mt-6">
          {loading && sheets.length === 0 ? (
            <AttendanceSheetSkeleton />
          ) : sheets.length === 0 ? (
            <EmptyState
              message="No attendance sheets found"
              actionLabel="Create Your First Sheet"
              onAction={() => setShowModal(true)}
            />
          ) : (
            <>
              {/* Loading overlay for subsequent loads */}
              <div className={`relative ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
                <AttendanceSheetList
                  sheets={sheets}
                  onDownload={handleDownload}
                  onEdit={handleEdit}
                  onDelete={openDeleteModal}
                  formatDate={formatDate}
                />
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={goToPage}
                hasNext={!!pagination.next}
                hasPrevious={!!pagination.previous}
              />

              {/* Results Info */}
              {pagination.count > 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.count)} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} sheets
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteState.open}
          title="Delete Attendance Sheet?"
          message={`Are you sure you want to delete the attendance sheet for "${deleteState.sheet?.event_title}" on ${formatDate(deleteState.sheet?.date)}? This action cannot be undone.`}
          illustration={TrashIllustration}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={closeDeleteModal}
          loading={loading}
        />
      </div>
    </main>
  );
}
