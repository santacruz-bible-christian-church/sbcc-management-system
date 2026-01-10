import { useState, useCallback } from 'react';

/**
 * Hook for managing File Management page modals
 */
export const useFileModals = () => {
  const [modalState, setModalState] = useState({ open: false, meeting: null });
  const [deleteState, setDeleteState] = useState({ open: false, item: null, type: null });
  const [saving, setSaving] = useState(false);

  const openCreateModal = useCallback(() => {
    setModalState({ open: true, meeting: null });
  }, []);

  const openEditModal = useCallback((meeting) => {
    setModalState({ open: true, meeting });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, meeting: null });
  }, []);

  const setModalMeeting = useCallback((meeting) => {
    setModalState((prev) => ({ ...prev, meeting }));
  }, []);

  const openDeleteModal = useCallback((item) => {
    // Don't allow deleting folders (categories)
    if (item.type === 'Category') return;
    const type = item.attachmentId ? 'attachment' : 'meeting';
    setDeleteState({ open: true, item, type });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, item: null, type: null });
  }, []);

  return {
    modalState,
    deleteState,
    saving,
    setSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    setModalMeeting,
    openDeleteModal,
    closeDeleteModal,
  };
};

export default useFileModals;
