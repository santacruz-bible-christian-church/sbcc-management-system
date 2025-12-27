import { MemberToolbar } from '../components/MemberToolbar';
import { MemberList } from '../components/MemberList';
import { useMembers } from '../hooks/useMembers';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import ArchiveIllustration from '../../../assets/Archive-Illustration.svg';
import { membersApi } from '../../../api/members.api';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { MemberFormModal } from '../components/MemberFormModal';
import { MemberEditModal } from '../components/MemberEditModal';
import CSVImportModal from '../components/CSVImportModal';
import { useMinistries } from '../../ministries/hooks/useMinistries';
import { showError, showSuccess, showWarning } from '../../../utils/toast';
import { generateMembershipFormPDF } from '../utils/memberFormPDF';
import { HiOutlineArchive, HiOutlineTrash } from 'react-icons/hi';

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

    // Sync search term with hook
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        setSearch(value);
    }, [setSearch]);

    // Fetch overall stats from backend API
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, archived: 0 });

    const fetchStats = useCallback(async () => {
        try {
            const data = await membersApi.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    // Fetch stats on mount and after any member changes
    useEffect(() => {
        fetchStats();
    }, [fetchStats, members]);

    // Modal states
    const [deleteState, setDeleteState] = useState({ open: false, member: null });
    const [archiveState, setArchiveState] = useState({ open: false, member: null });
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalState, setEditModalState] = useState({ open: false, member: null });
    const [detailsModalState, setDetailsModalState] = useState({ open: false, member: null });
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    // Multi-select state
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);

    // Calculate if all current page members are selected
    const allSelected = useMemo(() => {
        if (members.length === 0) return false;
        return members.every((member) => selectedIds.includes(member.id));
    }, [members, selectedIds]);

    // Toggle selection mode
    const toggleSelectionMode = useCallback(() => {
        setSelectionMode((prev) => {
            if (prev) setSelectedIds([]);
            return !prev;
        });
    }, []);

    // Handle individual selection
    const handleSelect = useCallback((memberId, isSelected) => {
        setSelectedIds((prev) =>
            isSelected ? [...prev, memberId] : prev.filter((id) => id !== memberId)
        );
    }, []);

    // Handle select all on current page
    const handleSelectAll = useCallback((selectAll) => {
        const currentPageIds = members.map((m) => m.id);
        setSelectedIds((prev) =>
            selectAll
                ? [...prev, ...currentPageIds.filter((id) => !prev.includes(id))]
                : prev.filter((id) => !currentPageIds.includes(id))
        );
    }, [members]);

    // Clear selection
    const clearSelection = useCallback(() => setSelectedIds([]), []);

    // Modals handlers
    const handleCreateMember = useCallback(() => {
        setCreateModalOpen(true);
    }, []);

    const handleEditMember = useCallback((member) => {
        setEditModalState({ open: true, member });
    }, []);

    const closeCreateModal = useCallback(() => {
        setCreateModalOpen(false);
    }, []);

    const closeEditModal = useCallback(() => {
        setEditModalState({ open: false, member: null });
    }, []);

    const handleViewDetails = useCallback((member) => {
        setDetailsModalState({ open: true, member });
    }, []);

    const closeDetailsModal = useCallback(() => {
        setDetailsModalState({ open: false, member: null });
    }, []);

    const openDeleteModal = useCallback((member) => {
        setDeleteState({ open: true, member });
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteState({ open: false, member: null });
    }, []);

    const openArchiveModal = useCallback((member) => {
        setArchiveState({ open: true, member });
    }, []);

    const closeArchiveModal = useCallback(() => {
        setArchiveState({ open: false, member: null });
    }, []);

    // Delete member
    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteState.member) return;
        try {
            await deleteMember(deleteState.member.id);
            showSuccess('Member deleted successfully');
        } catch {
            showError('Failed to delete member');
        }
        closeDeleteModal();
    }, [deleteState.member, deleteMember, closeDeleteModal]);

    // Archive member
    const handleArchiveConfirm = useCallback(async () => {
        if (!archiveState.member) return;
        try {
            await membersApi.archiveMember(archiveState.member.id);
            showSuccess('Member archived successfully');
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            showError(err.response?.data?.detail || 'Failed to archive member');
        }
        closeArchiveModal();
    }, [archiveState.member, refreshMembers, pagination.currentPage, closeArchiveModal]);

    // Restore member
    const handleRestoreMember = useCallback(async (member) => {
        try {
            await membersApi.restoreMember(member.id);
            showSuccess('Member restored successfully');
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            showError(err.response?.data?.detail || 'Failed to restore member');
        }
    }, [refreshMembers, pagination.currentPage]);

    // Bulk archive
    const handleBulkArchive = useCallback(async () => {
        setBulkActionLoading(true);
        try {
            await membersApi.bulkArchive(selectedIds);
            showSuccess(`Successfully archived ${selectedIds.length} members`);
            setSelectedIds([]);
            setSelectionMode(false);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            showError(err.response?.data?.detail || 'Failed to archive members');
        } finally {
            setBulkActionLoading(false);
            setBulkArchiveOpen(false);
        }
    }, [selectedIds, refreshMembers, pagination.currentPage]);

    // Bulk delete
    const handleBulkDelete = useCallback(async () => {
        setBulkActionLoading(true);
        try {
            await Promise.all(selectedIds.map((id) => membersApi.deleteMember(id)));
            showSuccess(`Successfully deleted ${selectedIds.length} members`);
            setSelectedIds([]);
            setSelectionMode(false);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            showError(err.response?.data?.detail || 'Failed to delete members');
        } finally {
            setBulkActionLoading(false);
            setBulkDeleteOpen(false);
        }
    }, [selectedIds, refreshMembers, pagination.currentPage]);

    // Create new member
    const handleCreateSubmit = useCallback(async (formData) => {
        setFormLoading(true);
        try {
            await createMember(formData);
            showSuccess('Member created successfully');
            closeCreateModal();
            await refreshMembers();
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.user?.[0]?.includes('already exists')) {
                showError('A member with this email already exists.');
            } else if (typeof errorData === 'object' && !errorData.detail) {
                const errorMessages = Object.entries(errorData)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('\n');
                showError(`Validation Error: ${errorMessages}`);
            } else {
                showError(errorData?.detail || 'Failed to create member');
            }
        } finally {
            setFormLoading(false);
        }
    }, [createMember, closeCreateModal, refreshMembers]);

    // Update existing member
    const handleEditSubmit = useCallback(async (formData) => {
        if (!editModalState.member) return;
        setFormLoading(true);
        try {
            await updateMember(editModalState.member.id, formData);
            showSuccess('Member updated successfully');
            closeEditModal();
            await refreshMembers();
        } catch (err) {
            const errorData = err.response?.data;
            if (typeof errorData === 'object' && !errorData.detail) {
                const errorMessages = Object.entries(errorData)
                    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                    .join('\n');
                showError(`Validation Error: ${errorMessages}`);
            } else {
                showError(errorData?.detail || 'Failed to update member');
            }
        } finally {
            setFormLoading(false);
        }
    }, [editModalState.member, updateMember, closeEditModal, refreshMembers]);

    // CSV Import
    const handleCSVImport = useCallback(async (file) => {
        setImporting(true);
        try {
            const response = await membersApi.importCSV(file);

            if (response.errors?.length > 0) {
                showWarning(`Imported ${response.members_created} members with ${response.errors.length} errors`);
            } else {
                showSuccess(`Successfully imported ${response.members_created} members!`);
            }

            // Auto-generate PDFs
            if (response.members?.length > 0) {
                showSuccess(`Generating ${response.members.length} membership form PDFs...`);
                response.members.forEach((member, index) => {
                    setTimeout(() => {
                        try {
                            generateMembershipFormPDF(member);
                        } catch (error) {
                            console.error(`Failed to generate PDF for ${member.first_name}:`, error);
                        }
                    }, index * 500);
                });
            }

            setCsvModalOpen(false);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            showError(err.response?.data?.detail || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    }, [refreshMembers, pagination.currentPage]);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
            <div className="space-y-4">
                {/* Unified Toolbar */}
                <MemberToolbar
                    stats={stats}
                    filters={filters}
                    setFilters={setFilters}
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchChange}
                    onCreateClick={handleCreateMember}
                    onImportClick={() => setCsvModalOpen(true)}
                    selectionMode={selectionMode}
                    onToggleSelectionMode={toggleSelectionMode}
                    canManage={canManage}
                />

                {/* Bulk Actions Toolbar */}
                {selectionMode && selectedIds.length > 0 && (
                    <div className="p-4 bg-[#FFF8E7] border border-[#FDB54A] rounded-xl flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3">
                            <span className="text-[#383838] font-medium">
                                {selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear selection
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setBulkArchiveOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#e68900] transition-colors"
                            >
                                <HiOutlineArchive className="w-5 h-5" />
                                Archive Selected
                            </button>
                            <button
                                onClick={() => setBulkDeleteOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#E55050] text-white rounded-lg hover:bg-[#d13e3e] transition-colors"
                            >
                                <HiOutlineTrash className="w-5 h-5" />
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                {/* Member List */}
                <MemberList
                    members={members}
                    loading={loading}
                    canManage={canManage}
                    onEdit={handleEditMember}
                    onDelete={openDeleteModal}
                    onArchive={openArchiveModal}
                    onRestore={handleRestoreMember}
                    onViewDetails={handleViewDetails}
                    pagination={pagination}
                    onPageChange={goToPage}
                    showCheckbox={selectionMode}
                    selectedIds={selectedIds}
                    allSelected={allSelected}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                open={deleteState.open}
                title="Delete Member?"
                message={`Are you sure you want to permanently delete ${deleteState.member?.full_name || deleteState.member?.first_name}? This action cannot be undone.`}
                illustration={TrashIllustration}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={closeDeleteModal}
                loading={loading}
            />

            {/* Archive Confirmation Modal */}
            <ConfirmationModal
                open={archiveState.open}
                title="Are you sure?"
                message={`Are you sure you want to archive ${archiveState.member?.full_name || archiveState.member?.first_name}? You can restore them later.`}
                illustration={ArchiveIllustration}
                confirmText="Confirm"
                confirmVariant="danger"
                onConfirm={handleArchiveConfirm}
                onCancel={closeArchiveModal}
                loading={loading}
            />

            {/* Bulk Archive Confirmation Modal */}
            <ConfirmationModal
                open={bulkArchiveOpen}
                title="Archive Selected Members?"
                message={`Are you sure you want to archive ${selectedIds.length} member${selectedIds.length > 1 ? 's' : ''}? You can restore them later.`}
                illustration={ArchiveIllustration}
                confirmText="Archive All"
                confirmVariant="danger"
                onConfirm={handleBulkArchive}
                onCancel={() => setBulkArchiveOpen(false)}
                loading={bulkActionLoading}
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmationModal
                open={bulkDeleteOpen}
                title="Delete Selected Members?"
                message={`Are you sure you want to permanently delete ${selectedIds.length} member${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`}
                illustration={TrashIllustration}
                confirmText="Delete All"
                confirmVariant="danger"
                onConfirm={handleBulkDelete}
                onCancel={() => setBulkDeleteOpen(false)}
                loading={bulkActionLoading}
            />

            {/* Member Create Modal (Wizard) */}
            <MemberFormModal
                open={createModalOpen}
                onClose={closeCreateModal}
                onSubmit={handleCreateSubmit}
                member={null}
                loading={formLoading}
                ministries={ministries}
            />

            {/* Member Edit Modal (Flat Form) */}
            <MemberEditModal
                open={editModalState.open}
                onClose={closeEditModal}
                onSubmit={handleEditSubmit}
                member={editModalState.member}
                loading={formLoading}
                ministries={ministries}
            />

            {/* Member Details Modal */}
            <MemberDetailsModal
                open={detailsModalState.open}
                onClose={closeDetailsModal}
                member={detailsModalState.member}
            />

            {/* CSV Import Modal */}
            <CSVImportModal
                open={csvModalOpen}
                onClose={() => setCsvModalOpen(false)}
                onImport={handleCSVImport}
                loading={importing}
            />
        </div>
    );
};

export default MembershipListPage;
