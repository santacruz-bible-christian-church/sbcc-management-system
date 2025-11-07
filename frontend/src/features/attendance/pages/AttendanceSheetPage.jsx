import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import AttendanceSheetInput from '../components/AttendanceSheetInput';
import { useAttendanceSheets } from '../hooks/useAttendanceSheets';
import { ConfirmationModal } from '../../../components/ui/Modal';

const ACCENT = '#FDB54A';

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

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
      // Validate data
      if (!data.eventId || !data.date) {
        console.error('Missing required fields:', data);
        return;
      }

      // Convert date format from mm/dd/yyyy to yyyy-mm-dd
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

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div>
            <h2 className="text-gray-600 text-sm">Page/Attendance</h2>
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

            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="pl-3 pr-2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search by event title..."
                className="w-80 md:w-96 py-2 px-2 outline-none text-sm text-gray-700"
              />
              <button
                type="submit"
                className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: ACCENT }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Create modal */}
          <AttendanceSheetInput
            open={showModal}
            onClose={() => setShowModal(false)}
            onCreate={handleCreate}
          />
        </div>

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
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No attendance sheets found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-[#FDB54A] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Sheet
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
              <div className="col-span-4">Event</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Attendance</div>
              <div className="col-span-1">Rate</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            {/* List items */}
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4"
                style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
              >
                <div className="col-span-4 text-gray-700 font-medium">
                  {sheet.event_title || 'Untitled Event'}
                </div>
                <div className="col-span-2 text-gray-600">
                  {formatDate(sheet.date)}
                </div>
                <div className="col-span-2 text-gray-600">
                  {sheet.total_attended || 0} / {sheet.total_expected || 0}
                </div>
                <div className="col-span-1 text-gray-600">
                  {sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : 'N/A'}
                </div>
                <div className="col-span-3 text-right flex items-center justify-end gap-4">
                  <button
                    title="Download CSV"
                    onClick={() => handleDownload(sheet)}
                    className="p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 text-[#FDB54A]" />
                  </button>
                  <button
                    title="Open tracker"
                    onClick={() => navigate('/attendance/tracker', { state: { attendanceId: sheet.id } })}
                    className="p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 text-[#FDB54A]" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => openDeleteModal(sheet)}
                    className="p-2 rounded-lg hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center py-6">
                <nav className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                  <button
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={!pagination.previous}
                    onClick={() => goToPage(pagination.currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {getPageNumbers().map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${
                          page === pagination.currentPage
                            ? 'bg-[#FDB54A] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={{ backgroundColor: page === pagination.currentPage ? ACCENT : undefined }}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                    disabled={!pagination.next}
                    onClick={() => goToPage(pagination.currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </nav>
              </div>
            )}

            {/* Results Info */}
            {pagination.count > 0 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.count)} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} sheets
              </div>
            )}
          </div>
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
