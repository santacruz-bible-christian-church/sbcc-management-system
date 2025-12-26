import { useState } from 'react';
import { HiPlus, HiRefresh, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useVisitors } from '../hooks/useVisitors';
import { StatsCards } from '../components/StatsCards';
import { VisitorsFilters } from '../components/VisitorsFilters';
import { VisitorsList } from '../components/VisitorsList';
import { VisitorModal } from '../components/VisitorModal';
import { CheckInModal } from '../components/CheckInModal';
import { ConvertToMemberModal } from '../components/ConvertToMemberModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import Snackbar from '../../../components/ui/Snackbar';

export function VisitorsPage() {
  const {
    visitors,
    statistics,
    pagination,
    loading,
    statsLoading,
    filters,
    setFilters,
    resetFilters,
    goToPage,
    createVisitor,
    updateVisitor,
    deleteVisitor,
    checkIn,
    convertToMember,
    refresh,
  } = useVisitors();

  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  // Modal states
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Handlers
  const handleAddNew = () => {
    setSelectedVisitor(null);
    setVisitorModalOpen(true);
  };

  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor);
    setVisitorModalOpen(true);
  };

  const handleCheckIn = (visitor) => {
    setSelectedVisitor(visitor);
    setCheckInModalOpen(true);
  };

  const handleConvert = (visitor) => {
    setSelectedVisitor(visitor);
    setConvertModalOpen(true);
  };

  const handleDelete = (visitor) => {
    setSelectedVisitor(visitor);
    setDeleteModalOpen(true);
  };

  // Submit handlers
  const handleVisitorSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (selectedVisitor) {
        await updateVisitor(selectedVisitor.id, data);
        showSuccess('Visitor updated successfully');
      } else {
        await createVisitor(data);
        showSuccess('Visitor added successfully');
      }
      setVisitorModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save visitor');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleCheckInSubmit = async (id, serviceDate) => {
    setModalLoading(true);
    try {
      await checkIn(id, serviceDate);
      showSuccess('Visitor checked in successfully');
      setCheckInModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to check in visitor');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleConvertSubmit = async (id, data) => {
    setModalLoading(true);
    try {
      const result = await convertToMember(id, data);
      showSuccess(`Visitor converted to member #${result.member_id}`);
      setConvertModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to convert visitor');
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async (id) => {
    setModalLoading(true);
    try {
      await deleteVisitor(id);
      showSuccess('Visitor deleted successfully');
      setDeleteModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete visitor');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Statistics with Actions */}
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm mb-4">
          <StatsCards statistics={statistics} loading={statsLoading} inline />
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#FDB54A] hover:bg-[#e5a43b] text-white font-medium rounded-lg transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add Visitor
            </button>
          </div>
        </div>

        {/* Filters */}
        <VisitorsFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={resetFilters}
        />

      {/* Visitors List */}
      <VisitorsList
        visitors={visitors}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCheckIn={handleCheckIn}
        onConvert={handleConvert}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {visitors.length} of {pagination.count} visitors
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(filters.page - 1)}
              disabled={!pagination.previous || loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => goToPage(filters.page + 1)}
              disabled={!pagination.next || loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <VisitorModal
        open={visitorModalOpen}
        onClose={() => setVisitorModalOpen(false)}
        visitor={selectedVisitor}
        onSubmit={handleVisitorSubmit}
        loading={modalLoading}
      />

      <CheckInModal
        open={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        visitor={selectedVisitor}
        onSubmit={handleCheckInSubmit}
        loading={modalLoading}
      />

      <ConvertToMemberModal
        open={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        visitor={selectedVisitor}
        onSubmit={handleConvertSubmit}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        visitor={selectedVisitor}
        onConfirm={handleDeleteConfirm}
        loading={modalLoading}
      />

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
      </div>
    </main>
  );
}

export default VisitorsPage;
