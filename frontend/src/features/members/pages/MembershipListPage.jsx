import { MemberToolbar } from '../components/MemberToolbar';
import { MemberList } from '../components/MemberList';
import { BulkActionsBar } from '../components/BulkActionsBar';
import { MembersSkeleton } from '../components/MembersSkeleton';
import { useMembers } from '../hooks/useMembers';
import { useMembersPageModals } from '../hooks/useMembersPageModals';
import { useMembersPageActions } from '../hooks/useMembersPageActions';
import { useMembersBulkActions } from '../hooks/useMembersBulkActions';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import ArchiveIllustration from '../../../assets/Archive-Illustration.svg';
import { membersApi } from '../../../api/members.api';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { MemberFormModal } from '../components/MemberFormModal';
import { MemberEditModal } from '../components/MemberEditModal';
import CSVImportModal from '../components/CSVImportModal';
import { useMinistries } from '../../ministries/hooks/useMinistries';

const MANAGER_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const MembershipListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);
  const { ministries } = useMinistries();

  const {
    members,
    loading,
    filters,
    pagination,
    setFilters,
    setSearch,
    deleteMember,
    createMember,
    updateMember,
    goToPage,
    refresh: refreshMembers,
  } = useMembers();

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Sync debounced search term with API
  useEffect(() => {
    setSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearch]);

  // Stats from backend
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, archived: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const data = await membersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, members]);

  // Modal states (extracted to hook)
  const modals = useMembersPageModals();

  // Bulk actions (extracted to hook)
  const bulk = useMembersBulkActions({ members, refreshMembers, pagination });

  // CRUD actions (extracted to hook)
  const actions = useMembersPageActions({
    createMember,
    updateMember,
    deleteMember,
    refreshMembers,
    pagination,
    modals,
  });

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="space-y-4">
        {/* Unified Toolbar */}
        <MemberToolbar
          stats={stats}
          filters={filters}
          setFilters={setFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onCreateClick={modals.openCreateModal}
          onImportClick={modals.openCsvModal}
          selectionMode={bulk.selectionMode}
          onToggleSelectionMode={bulk.toggleSelectionMode}
          canManage={canManage}
        />

        {/* Bulk Actions Toolbar */}
        {bulk.selectionMode && (
          <BulkActionsBar
            selectedCount={bulk.selectedIds.length}
            onArchive={() => bulk.setBulkArchiveOpen(true)}
            onDelete={() => bulk.setBulkDeleteOpen(true)}
            onClearSelection={bulk.clearSelection}
          />
        )}

        {/* Member List */}
        <MemberList
          members={members}
          loading={loading}
          canManage={canManage}
          onEdit={modals.openEditModal}
          onDelete={modals.openDeleteModal}
          onArchive={modals.openArchiveModal}
          onRestore={actions.handleRestoreMember}
          onViewDetails={modals.openDetailsModal}
          pagination={pagination}
          onPageChange={goToPage}
          showCheckbox={bulk.selectionMode}
          selectedIds={bulk.selectedIds}
          allSelected={bulk.allSelected}
          onSelect={bulk.handleSelect}
          onSelectAll={bulk.handleSelectAll}
          birthdayMonthFilter={filters.birthday_month}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={modals.deleteState.open}
        title="Delete Member?"
        message={`Are you sure you want to permanently delete ${modals.deleteState.member?.full_name || modals.deleteState.member?.first_name}? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={actions.handleDeleteConfirm}
        onCancel={modals.closeDeleteModal}
        loading={loading}
      />

      {/* Archive Confirmation Modal */}
      <ConfirmationModal
        open={modals.archiveState.open}
        title="Are you sure?"
        message={`Are you sure you want to archive ${modals.archiveState.member?.full_name || modals.archiveState.member?.first_name}? You can restore them later.`}
        illustration={ArchiveIllustration}
        confirmText="Confirm"
        confirmVariant="danger"
        onConfirm={actions.handleArchiveConfirm}
        onCancel={modals.closeArchiveModal}
        loading={loading}
      />

      {/* Bulk Archive Confirmation Modal */}
      <ConfirmationModal
        open={bulk.bulkArchiveOpen}
        title="Archive Selected Members?"
        message={`Are you sure you want to archive ${bulk.selectedIds.length} member${bulk.selectedIds.length > 1 ? 's' : ''}? You can restore them later.`}
        illustration={ArchiveIllustration}
        confirmText="Archive All"
        confirmVariant="danger"
        onConfirm={bulk.handleBulkArchive}
        onCancel={() => bulk.setBulkArchiveOpen(false)}
        loading={bulk.bulkActionLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        open={bulk.bulkDeleteOpen}
        title="Delete Selected Members?"
        message={`Are you sure you want to permanently delete ${bulk.selectedIds.length} member${bulk.selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete All"
        confirmVariant="danger"
        onConfirm={bulk.handleBulkDelete}
        onCancel={() => bulk.setBulkDeleteOpen(false)}
        loading={bulk.bulkActionLoading}
      />

      {/* Member Create Modal (Wizard) */}
      <MemberFormModal
        open={modals.createModalOpen}
        onClose={modals.closeCreateModal}
        onSubmit={actions.handleCreateSubmit}
        member={null}
        loading={modals.formLoading}
        ministries={ministries}
      />

      {/* Member Edit Modal (Flat Form) */}
      <MemberEditModal
        open={modals.editModalState.open}
        onClose={modals.closeEditModal}
        onSubmit={actions.handleEditSubmit}
        member={modals.editModalState.member}
        loading={modals.formLoading}
        ministries={ministries}
      />

      {/* Member Details Modal */}
      <MemberDetailsModal
        open={modals.detailsModalState.open}
        onClose={modals.closeDetailsModal}
        member={modals.detailsModalState.member}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        open={modals.csvModalOpen}
        onClose={modals.closeCsvModal}
        onImport={actions.handleCSVImport}
        loading={modals.importing}
      />
    </div>
  );
};

export default MembershipListPage;