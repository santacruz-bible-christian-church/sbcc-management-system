import { MemberListNavBar } from '../components/MemberListNavBar';
import { ListHeaders } from '../components/ListHeaders';
import { ListCards } from '../components/ListCards';
import { useMembers } from '../hooks/useMembers';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCallback, useState, useEffect } from 'react';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { membersApi } from '../../../api/members.api';
import { MemberDetailsModal } from '../components/MemberDetailsModal';
import { MemberFormModal } from '../components/MemberFormModal';
import { useMinistries } from '../../ministries/hooks/useMinistries';

const MANAGER_ROLES = ['admin', 'pastor', 'ministry_leader'];

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
            alert(err.response?.data?.detail || 'Failed to archive member');
        }
    }, [archiveState.member, refreshMembers, pagination.currentPage, closeArchiveModal]);

    // Restore handler
    const handleRestoreMember = useCallback(async (member) => {
        try {
            await membersApi.restoreMember(member.id);
            await refreshMembers(pagination.currentPage);
        } catch (err) {
            console.error('Restore member error:', err);
            alert(err.response?.data?.detail || 'Failed to restore member');
        }
    }, [refreshMembers, pagination.currentPage]);



    // Form Modal handlers
    const handleCreateMember = useCallback(() => {
        setFormModalState({ open: true, member: null });
    }, []);

    const handleEditMember = useCallback((member) => {
        console.log('Editing member:', member);  // ADD THIS
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
                console.log('=== UPDATING MEMBER ===');
                console.log('Member ID:', formModalState.member.id);
                console.log('Form data being sent:', formData);
                await updateMember(formModalState.member.id, formData);
            } else {
                // Create new member
                console.log('=== CREATING MEMBER ===');
                console.log('Form data being sent:', formData);
                await createMember(formData);
            }
            closeFormModal();
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
                        alert(
                            `A member with this email already exists.\n\n` +
                            `Please check if this person is already in the system, ` +
                            `or use a different email address.`
                        );
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
                    alert(`Validation Error:\n\n${errorMessages}`);
                } else {
                    // Simple error message
                    alert(errorData.detail || JSON.stringify(errorData));
                }
            } else {
                alert('Failed to save member - Unknown error');
            }
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
        <div className='ml-12 mt-12 mr-10'>
            <h1 className='text-[30px] text-[#383838] leading-none font-bold mb-5'>
                Member List
            </h1>
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

                <ListHeaders />

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
                />
            </div>

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
