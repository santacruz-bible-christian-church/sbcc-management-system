import { MemberListNavBar } from '../components/MemberListNavBar';
import { ListHeaders } from '../components/ListHeaders';
import { ListCards } from '../components/ListCards';
import { useMembers } from '../hooks/useMembers';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import ArchiveIllustration from '../../../assets/Archive-Illustration.svg';
import { membersApi } from '../../../api/members.api';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { MemberFormModal } from '../components/MemberFormModal';
import { useMinistries } from '../../ministries/hooks/useMinistries';
import { showError, showSuccess, showWarning } from '../../../utils/toast';
import { generateMembershipFormPDF } from '../../../utils/memberFormPDF';
import { HiOutlineArchive, HiOutlineTrash, HiX, HiCheckCircle } from 'react-icons/hi';

const MANAGER_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const MembershipListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const canManage = MANAGER_ROLES.includes(user?.role);
    const { ministries, loading: ministriesLoading } = useMinistries();

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

    useEffect(() => {
        setSearch(searchTerm);
    }, [searchTerm, setSearch]);

    const [deleteState, setDeleteState] = useState({ open: false, member: null });
    const [archiveState, setArchiveState] = useState({ open: false, member: null });
    const [formModalState, setFormModalState] = useState({ open: false, member: null });
    const [detailsModalState, setDetailsModalState] = useState({ open: false, member: null });
    const [formLoading, setFormLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [csvImportOpen, setCsvImportOpen] = useState(false);

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
            if (prev) {
                // Exiting selection mode, clear selections
                setSelectedIds([]);
            }
            return !prev;
        });
    }, []);

    // Handle individual selection
    const handleSelect = useCallback((memberId, isSelected) => {
        setSelectedIds((prev) => {
            if (isSelected) {
                return [...prev, memberId];
            } else {
                return prev.filter((id) => id !== memberId);
            }
        });
    }, []);

    // Handle select all on current page
    const handleSelectAll = useCallback((selectAll) => {
        if (selectAll) {
            const currentPageIds = members.map((m) => m.id);
            setSelectedIds((prev) => {
                const newIds = currentPageIds.filter((id) => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            const currentPageIds = members.map((m) => m.id);
            setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        }
    }, [members]);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    // Bulk archive handler
    const handleBulkArchive = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setBulkActionLoading(true);
        try {
            await membersApi.bulkArchive(selectedIds);
            showSuccess(`Successfully archived ${selectedIds.length} members`);
            setSelectedIds([]);
            setBulkArchiveOpen(false);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            console.error('Bulk archive error:', err);
            showError(err.response?.data?.detail || 'Failed to archive members');
        } finally {
            setBulkActionLoading(false);
        }
    }, [selectedIds, refreshMembers, pagination.currentPage]);

    // Bulk delete handler
    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.length === 0) return;

        setBulkActionLoading(true);
        try {
            // Delete each member individually
            let successCount = 0;
            let failCount = 0;

            for (const id of selectedIds) {
                try {
                    await deleteMember(id);
                    successCount++;
                } catch (err) {
                    failCount++;
                    console.error(`Failed to delete member ${id}:`, err);
                }
            }

            if (failCount > 0) {
                showWarning(`Deleted ${successCount} members, ${failCount} failed`);
            } else {
                showSuccess(`Successfully deleted ${successCount} members`);
            }

            setSelectedIds([]);
            setBulkDeleteOpen(false);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            console.error('Bulk delete error:', err);
            showError('Failed to delete members');
        } finally {
            setBulkActionLoading(false);
        }
    }, [selectedIds, deleteMember, refreshMembers, pagination.currentPage]);

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
                showSuccess('Member updated successfully');
            } else {
                // Create new member
                await createMember(formData);
                showSuccess('Member created successfully');
            }

            closeFormModal();
            await refreshMembers();

        } catch (err) {
            console.error('=== ERROR DETAILS ===');
            console.error('Status:', err.response?.status);
            console.error('Backend error data:', err.response?.data);
            console.error('Full error:', err);

            // Show the actual backend error
            if (err.response?.data) {
                const errorData = err.response.data;

                // Check for specific "user already exists" error
                if (errorData.user && Array.isArray(errorData.user)) {
                    if (errorData.user[0].includes('already exists')) {
                        showError('A member with this email already exists. Please check if this person is already in the system.');
                        return;
                    }
                }

                // If it's a validation error object
                if (typeof errorData === 'object' && !errorData.detail) {
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => {
                            const msg = Array.isArray(messages) ? messages.join(', ') : messages;
                            return `${field}: ${msg}`;
                        })
                        .join('\n');
                    showError(`Validation Error: ${errorMessages}`);
                } else {
                    // Simple error message
                    showError(errorData.detail || 'An error occurred');
                }
            } else {
                showError('Failed to save member - Unknown error');
            }
        } finally {
            setFormLoading(false);
        }
    }, [formModalState.member, createMember, updateMember, closeFormModal, refreshMembers]);

    // Details Modal handlers
    const handleViewDetails = useCallback((member) => {
        setDetailsModalState({ open: true, member });
    }, []);

    const closeDetailsModal = useCallback(() => {
        setDetailsModalState({ open: false, member: null });
    }, []);

    // CSV Import with Auto PDF Generation
    const handleCSVImport = useCallback(async (file) => {
        setImporting(true);
        try {
            const response = await membersApi.importCSV(file);

            // ✅ Show import success message
            if (response.errors && response.errors.length > 0) {
                showWarning(`Imported ${response.members_created} members with ${response.errors.length} errors`);
                console.error('Import errors:', response.errors);
            } else {
                showSuccess(`Successfully imported ${response.members_created} members!`);
            }

            // ✅ Auto-generate PDFs for all imported members
            if (response.members && response.members.length > 0) {
                showSuccess(`Generating ${response.members.length} membership form PDFs...`);

                // Generate PDFs with delay to avoid overwhelming browser
                response.members.forEach((member, index) => {
                    setTimeout(() => {
                        try {
                          generateMembershipFormPDF(member);
                          console.log(`✅ Generated PDF for: ${member.first_name} ${member.last_name}`);
                        } catch (error) {
                          console.error(`❌ Failed to generate PDF for ${member.first_name} ${member.last_name}:`, error);
                        }
                    }, index * 500); // 500ms delay between each PDF
                });

                // Show completion message after all PDFs are generated
                setTimeout(() => {
                  showSuccess(`✅ All ${response.members.length} membership forms generated!`);
                }, response.members.length * 500 + 1000);
              }

            // ✅ Close modal and refresh list
            setCsvImportOpen(false);
            await refreshMembers(pagination.currentPage);

        } catch (err) {
            console.error('CSV import error:', err);
            showError(err.response?.data?.detail || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    }, [refreshMembers, pagination.currentPage]);

    return (
        <div className='ml-12 mt-12 mr-10'>
            <div className="flex items-center justify-between mb-5">
                <h1 className='text-[30px] text-[#383838] leading-none font-bold'>
                    Member List
                </h1>
                {/* Selection Mode Toggle */}
                {canManage && (
                    <button
                        onClick={toggleSelectionMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            selectionMode
                                ? 'bg-[#FDB54A] text-white'
                                : 'border border-[#FDB54A] text-[#FDB54A] hover:bg-[#FDB54A] hover:text-white'
                        }`}
                    >
                        <HiCheckCircle className="w-5 h-5" />
                        {selectionMode ? 'Exit Selection' : 'Select Multiple'}
                    </button>
                )}
            </div>

            {/* Bulk Actions Toolbar */}
            {selectionMode && selectedIds.length > 0 && (
                <div className="mb-4 p-4 bg-[#FFF8E7] border border-[#FDB54A] rounded-xl flex items-center justify-between animate-fade-in">
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

            <div className="space-y-4">
                <MemberListNavBar
                    filters={filters}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setFilters={setFilters}
                    pagination={pagination}
                    refreshMembers={refreshMembers}
                    onCreateClick={handleCreateMember}
                />

                <ListHeaders
                    showCheckbox={selectionMode}
                    allSelected={allSelected}
                    onSelectAll={handleSelectAll}
                />

                <ListCards
                    members={members}
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
                    onSelect={handleSelect}
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
    )
}
