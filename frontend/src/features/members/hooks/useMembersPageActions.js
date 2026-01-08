import { useCallback } from 'react';
import { membersApi } from '../../../api/members.api';
import { showError, showSuccess, showWarning } from '../../../utils/toast';
import { generateMembershipFormPDF } from '../utils/memberFormPDF';

/**
 * Hook for handling member CRUD actions
 * Extracted to reduce page component complexity
 */
export function useMembersPageActions({
  createMember,
  updateMember,
  deleteMember,
  refreshMembers,
  pagination,
  modals,
}) {
  const {
    deleteState,
    archiveState,
    editModalState,
    closeDeleteModal,
    closeArchiveModal,
    closeCreateModal,
    closeEditModal,
    closeCsvModal,
    setFormLoading,
    setImporting,
  } = modals;

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
  }, [createMember, closeCreateModal, refreshMembers, setFormLoading]);

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
  }, [editModalState.member, updateMember, closeEditModal, refreshMembers, setFormLoading]);

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

      closeCsvModal();
      await refreshMembers(pagination.currentPage);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  }, [refreshMembers, pagination.currentPage, closeCsvModal, setImporting]);

  return {
    handleDeleteConfirm,
    handleArchiveConfirm,
    handleRestoreMember,
    handleCreateSubmit,
    handleEditSubmit,
    handleCSVImport,
  };
}

export default useMembersPageActions;
