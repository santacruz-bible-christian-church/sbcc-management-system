import { useCallback, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi';
import { FaSliders } from 'react-icons/fa6';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMembers } from '../hooks/useMembers';
import { useMinistries } from '../../ministries/hooks/useMinistries';
import { MemberTable } from '../components/MemberTable';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { CSVImportModal } from '../components/CSVImportModal';
import { MemberFormModal } from '../components/MemberFormModal';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { membersApi } from '../../../api/members.api';
import { showError, showSuccess } from '../../../utils/toast';

const MANAGER_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const MembershipListPage = () => {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const {
    members,
    loading,
    error,
    filters,
    search,
    pagination,
    setFilters,
    setSearch,
    resetFilters,
    deleteMember,
    createMember,
    updateMember,
    goToPage,
    refresh: refreshMembers,
  } = useMembers();

  const { ministries, loading: ministriesLoading } = useMinistries();

  const [searchDraft, setSearchDraft] = useState(search);
  const [deleteState, setDeleteState] = useState({ open: false, member: null });
  const [archiveState, setArchiveState] = useState({ open: false, member: null });
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formModalState, setFormModalState] = useState({ open: false, member: null });
  const [detailsModalState, setDetailsModalState] = useState({ open: false, member: null });
  const [formLoading, setFormLoading] = useState(false);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  }, [searchDraft, setSearch]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setSearchDraft('');
  }, [resetFilters]);

  // Delete handlers
  const openDeleteModal = useCallback((member) => {
    setDeleteState({ open: true, member });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, member: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.member) return;

    try {
      await deleteMember(deleteState.member.id);
      closeDeleteModal();
    } catch (err) {
      console.error('Delete member error:', err);
    }
  }, [deleteState.member, deleteMember, closeDeleteModal]);

  // Archive handlers
  const openArchiveModal = useCallback((member) => {
    setArchiveState({ open: true, member });
  }, []);

  const closeArchiveModal = useCallback(() => {
    setArchiveState({ open: false, member: null });
  }, []);

  const handleArchiveConfirm = useCallback(async () => {
    if (!archiveState.member) return;

    try {
      await membersApi.archiveMember(archiveState.member.id);
      await refreshMembers(pagination.currentPage);
      closeArchiveModal();
    } catch (err) {
      console.error('Archive member error:', err);
      showError(err.response?.data?.detail || 'Failed to archive member');
    }
  }, [archiveState.member, refreshMembers, pagination.currentPage, closeArchiveModal]);

  // Restore handler
  const handleRestoreMember = useCallback(async (member) => {
    try {
      await membersApi.restoreMember(member.id);
      await refreshMembers(pagination.currentPage);
    } catch (err) {
      console.error('Restore member error:', err);
      showError(err.response?.data?.detail || 'Failed to restore member');
    }
  }, [refreshMembers, pagination.currentPage]);

  // CSV Import
  const handleCSVImport = useCallback(async (file) => {
    setImporting(true);
    try {
      await membersApi.importCSV(file);
      setCsvImportOpen(false);
      await refreshMembers(pagination.currentPage);
      showSuccess('Members imported successfully!'); // ← Changed from alert()
    } catch (err) {
      console.error('CSV import error:', err);
      showError(err.response?.data?.detail || 'Failed to import CSV'); // ← Changed from alert()
    } finally {
      setImporting(false);
    }
  }, [refreshMembers, pagination.currentPage]);

  // Form Modal handlers
  const handleCreateMember = useCallback(() => {
    setFormModalState({ open: true, member: null });
  }, []);

  const handleEditMember = useCallback((member) => {
    setFormModalState({ open: true, member });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModalState({ open: false, member: null });
  }, []);

  const handleFormSubmit = useCallback(async (formData) => {
    setFormLoading(true);
    try {
      if (formModalState.member) {
        // Update existing member
        await updateMember(formModalState.member.id, formData);
      } else {
        // Create new member
        await createMember(formData);
      }
      closeFormModal();
    } catch (err) {
      console.error('Form submit error:', err);
      showError(err.response?.data?.detail || 'Failed to save member'); // ← Changed from alert()
    } finally {
      setFormLoading(false);
    }
  }, [formModalState.member, createMember, updateMember, closeFormModal]);

  // Details Modal handlers
  const handleViewDetails = useCallback((member) => {
    setDetailsModalState({ open: true, member });
  }, []);

  const closeDetailsModal = useCallback(() => {
    setDetailsModalState({ open: false, member: null });
  }, []);

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <p className="text-[15px] text-[#A0A0A0] leading-none mb-1">
          Pages/Membership
        </p>
        <h1 className="text-[30px] text-[#383838] leading-none font-bold">
          Member List
        </h1>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        {/* Add & Import Buttons */}
        {canManage && (
          <div className="flex gap-2">
            <button
              className="rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
              onClick={handleCreateMember}
              title="Add new member"
              aria-label="Add new member"
            >
              <HiOutlinePlus className="w-5 h-5" />
            </button>

            <button
              className="rounded-lg p-3 bg-[#4CAF50] text-white hover:bg-[#45a049] transition-colors flex items-center justify-center"
              onClick={() => setCsvImportOpen(true)}
              title="Import CSV"
              aria-label="Import members from CSV"
            >
              <HiOutlineUpload className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative flex items-center h-full bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)]">
            <div className="absolute left-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="flex-1 pl-10 pr-3 py-3 text-sm text-[#383838] placeholder:text-[#A0A0A0] bg-transparent border-none focus:ring-0 focus:outline-none rounded-lg"
              placeholder="Search members..."
              aria-label="Search members"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-[#FDB54A] hover:bg-[#e5a43b] text-white text-sm font-medium rounded-r-lg transition-colors"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Section */}
        <div className="flex items-center gap-0 bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] overflow-hidden">
          {/* Filter Icon */}
          <div className="px-3 flex items-center justify-center">
            <FaSliders className="w-5 h-5 text-[#FDB54A]" />
          </div>

          {/* Status Dropdown - ADD THIS */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-3 text-sm text-[#383838] bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer min-w-[120px]"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Gender Dropdown */}
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="px-4 py-3 text-sm text-[#383838] bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer min-w-[120px]"
            aria-label="Filter by gender"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* Ministry Dropdown */}
          <select
            value={filters.ministry}
            onChange={(e) => handleFilterChange('ministry', e.target.value)}
            className="px-4 py-3 text-sm text-[#383838] bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer min-w-[140px]"
            aria-label="Filter by ministry"
            disabled={ministriesLoading}
          >
            <option value="">Ministry</option>
            {ministries.map((ministry) => (
              <option key={ministry.id} value={ministry.id}>
                {ministry.name}
              </option>
            ))}
          </select>

          {/* Clear Button */}
          <button
            onClick={handleClearFilters}
            className="px-8 py-3 bg-[#FDB54A] hover:bg-[#e5a43b] text-white text-sm font-medium transition-colors"
            type="button"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Members Table */}
      {loading && members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="xl" />
          <p className="mt-3 text-[#A0A0A0]">Loading members...</p>
        </div>
      ) : (
        <MemberTable
          members={members}
          canManage={canManage}
          onEdit={handleEditMember}
          onDelete={openDeleteModal}
          onArchive={openArchiveModal}
          onRestore={handleRestoreMember}
          onViewDetails={handleViewDetails}
          pagination={pagination}
          onPageChange={goToPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete Member?"
        message={`Are you sure you want to permanently delete ${deleteState.member?.full_name || deleteState.member?.first_name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={loading}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        open={archiveState.open}
        title="Archive Member?"
        message={`Are you sure you want to archive ${archiveState.member?.full_name || archiveState.member?.first_name}? You can restore them later.`}
        confirmText="Archive"
        confirmVariant="warning"
        onConfirm={handleArchiveConfirm}
        onCancel={closeArchiveModal}
        loading={loading}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleCSVImport}
        loading={importing}
      />

      {/* Member Form Modal (Add/Edit) */}
      <MemberFormModal
        open={formModalState.open}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        member={formModalState.member}
        loading={formLoading}
        ministries={ministries}
      />

      {/* Member Details Modal */}
      <MemberDetailsModal
        open={detailsModalState.open}
        onClose={closeDetailsModal}
        member={detailsModalState.member}
      />
    </div>
  );
};

export default MembershipListPage;
