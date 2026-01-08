import { useState, useCallback } from 'react';

/**
 * Hook for managing all modal states in MembershipListPage
 * Extracted to reduce page component complexity
 */
export function useMembersPageModals() {
  // Delete confirmation modal
  const [deleteState, setDeleteState] = useState({ open: false, member: null });

  // Archive confirmation modal
  const [archiveState, setArchiveState] = useState({ open: false, member: null });

  // Create member modal (wizard)
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Edit member modal
  const [editModalState, setEditModalState] = useState({ open: false, member: null });

  // Member details modal
  const [detailsModalState, setDetailsModalState] = useState({ open: false, member: null });

  // CSV import modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // Form loading state (shared across create/edit)
  const [formLoading, setFormLoading] = useState(false);

  // CSV importing state
  const [importing, setImporting] = useState(false);

  // === Modal Handlers ===

  // Create modal
  const openCreateModal = useCallback(() => setCreateModalOpen(true), []);
  const closeCreateModal = useCallback(() => setCreateModalOpen(false), []);

  // Edit modal
  const openEditModal = useCallback((member) => {
    setEditModalState({ open: true, member });
  }, []);
  const closeEditModal = useCallback(() => {
    setEditModalState({ open: false, member: null });
  }, []);

  // Details modal
  const openDetailsModal = useCallback((member) => {
    setDetailsModalState({ open: true, member });
  }, []);
  const closeDetailsModal = useCallback(() => {
    setDetailsModalState({ open: false, member: null });
  }, []);

  // Delete modal
  const openDeleteModal = useCallback((member) => {
    setDeleteState({ open: true, member });
  }, []);
  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, member: null });
  }, []);

  // Archive modal
  const openArchiveModal = useCallback((member) => {
    setArchiveState({ open: true, member });
  }, []);
  const closeArchiveModal = useCallback(() => {
    setArchiveState({ open: false, member: null });
  }, []);

  // CSV modal
  const openCsvModal = useCallback(() => setCsvModalOpen(true), []);
  const closeCsvModal = useCallback(() => setCsvModalOpen(false), []);

  return {
    // States
    deleteState,
    archiveState,
    createModalOpen,
    editModalState,
    detailsModalState,
    csvModalOpen,
    formLoading,
    importing,

    // Setters (for action handlers)
    setFormLoading,
    setImporting,

    // Handlers
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDetailsModal,
    closeDetailsModal,
    openDeleteModal,
    closeDeleteModal,
    openArchiveModal,
    closeArchiveModal,
    openCsvModal,
    closeCsvModal,
  };
}

export default useMembersPageModals;
