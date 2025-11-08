import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import { useAttendanceSheets } from '../hooks/useAttendanceSheets';
import {
  AttendanceSheetInput,
  AttendanceSheetList
} from '../components';
import {
  SearchBar,
  Pagination,
  EmptyState,
  ConfirmationModal
} from '../../../components/ui';

const ACCENT = '#FDB54A';

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
    search,
    pagination,
    setSearch,
    goToPage,
    createSheet,
    deleteSheet,
    downloadSheet,
  } = useAttendanceSheets();

  const [showModal, setShowModal] = useState(false);
  const [searchDraft, setSearchDraft] = useState(search);
  const [deleteState, setDeleteState] = useState({ open: false, sheet: null });

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  }, [searchDraft, setSearch]);

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
    } catch (err) {
      console.error('Create sheet error:', err);
    }
  }, [createSheet]);

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
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [deleteState.sheet, deleteSheet, closeDeleteModal]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Attendance Sheets</h1>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center h-10 px-3 bg-[#FDB54A] text-white rounded-lg shadow-sm hover:opacity-95"
              onClick={() => setShowModal(true)}
              style={{ backgroundColor: ACCENT }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>

            <SearchBar
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onSubmit={handleSearchSubmit}
              placeholder="Search by event title..."
            />
          </div>
        </div>

        {/* Create Modal */}
        <AttendanceSheetInput
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        {loading && sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="xl" />
            <p className="mt-3 text-gray-500">Loading attendance sheets...</p>
          </div>
        ) : sheets.length === 0 ? (
          <EmptyState
            message="No attendance sheets found"
            actionLabel="Create Your First Sheet"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <>
            <AttendanceSheetList
              sheets={sheets}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
              formatDate={formatDate}
            />

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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteState.open}
          title="Delete Attendance Sheet?"
          message={`Are you sure you want to delete the attendance sheet for "${deleteState.sheet?.event_title}" on ${formatDate(deleteState.sheet?.date)}? This action cannot be undone.`}
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
