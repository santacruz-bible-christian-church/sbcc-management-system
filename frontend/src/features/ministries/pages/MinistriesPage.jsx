import { useCallback, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlinePlus } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMinistries } from '../hooks/useMinistries';
import { MinistryCard } from '../components/MinistryCard';
import { MinistryFormModal } from '../components/MinistryFormModal';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { useNavigate } from 'react-router-dom';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';

const MANAGER_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const MinistriesPage = () => {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);
  const navigate = useNavigate();

  const {
    ministries,
    loading,
    error,
    search,
    pagination,
    setSearch,
    goToPage,
    createMinistry,
    updateMinistry,
    deleteMinistry,
  } = useMinistries();

  const [searchDraft, setSearchDraft] = useState(search);
  const [formModal, setFormModal] = useState({ open: false, ministry: null });
  const [deleteState, setDeleteState] = useState({ open: false, ministry: null });

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  }, [searchDraft, setSearch]);

  const openCreateModal = useCallback(() => {
    setFormModal({ open: true, ministry: null });
  }, []);

  const openEditModal = useCallback((ministry) => {
    setFormModal({ open: true, ministry });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModal({ open: false, ministry: null });
  }, []);

  const handleFormSubmit = useCallback(async (data) => {
    if (formModal.ministry) {
      await updateMinistry(formModal.ministry.id, data);
    } else {
      await createMinistry(data);
    }
  }, [formModal.ministry, createMinistry, updateMinistry]);

  const openDeleteModal = useCallback((ministry) => {
    setDeleteState({ open: true, ministry });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, ministry: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.ministry) return;

    try {
      await deleteMinistry(deleteState.ministry.id);
      closeDeleteModal();
    } catch (err) {
      console.error('Delete ministry error:', err);
    }
  }, [deleteState.ministry, deleteMinistry, closeDeleteModal]);

  const handleViewDetails = useCallback((ministry) => {
    navigate(`/ministries/${ministry.id}`);
  }, [navigate]);

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
    <div className="max-w-[95%] mx-auto p-4 md:p-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <h1 className="text-[30px] text-[#383838] leading-none font-bold">
          Ministries
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        {/* Add Button */}
        {canManage && (
          <button
            className="border rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
            onClick={openCreateModal}
            aria-label="Add new ministry"
          >
            <HiOutlinePlus className="w-5 h-5" />
          </button>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg">
          <div className="relative rounded-lg h-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="block w-full h-full ps-10 text-sm text-[#383838] placeholder:text-[#A0A0A0] rounded-lg bg-gray-50 focus:ring-[#FDB54A] border-none focus:border-[#FDB54A]"
              placeholder="Search ministries..."
              aria-label="Search ministries"
            />
            <button
              type="submit"
              className="text-white absolute end-0 bottom-0 h-full bg-[#FDB54A] hover:bg-[#e5a43b] focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-8"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Ministries Grid */}
      {loading && ministries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="xl" />
          <p className="mt-3 text-[#A0A0A0]">Loading ministries...</p>
        </div>
      ) : ministries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#A0A0A0] text-lg">No ministries found</p>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="mt-4 bg-[#FDB54A] hover:bg-[#e5a43b] text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Ministry
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministries.map((ministry) => (
              <MinistryCard
                key={ministry.id}
                ministry={ministry}
                canManage={canManage}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.previous}
                className={`px-3 py-2 rounded transition-colors ${
                  !pagination.previous
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-100'
                }`}
                aria-label="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-[#FDB54A] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next Button */}
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.next}
                className={`px-3 py-2 rounded transition-colors ${
                  !pagination.next
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-100'
                }`}
                aria-label="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Results Info */}
          {pagination.count > 0 && (
            <div className="text-center text-sm text-[#A0A0A0] mt-4">
              Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.count)} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} ministries
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <MinistryFormModal
        open={formModal.open}
        ministry={formModal.ministry}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      {/* NOTE: Updated to use two-column confirmation modal with illustration
          (Trash-WarmTone.svg) — matches Attendance and Members delete modal. Illustration
          is passed via the `illustration` prop so it remains configurable. */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete Ministry?"
        message={`Are you sure you want to delete "${deleteState.ministry?.name}"? This will also remove all associated members, shifts, and assignments. This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={loading}
      />
    </div>
  );
};

export default MinistriesPage;
