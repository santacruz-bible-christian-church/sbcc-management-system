import { useState, useCallback } from 'react';

/**
 * Hook for managing User Management page modals
 */
export const useUserModals = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openCreateModal = useCallback(() => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  }, []);

  const openEditModal = useCallback((user) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  const openPasswordModal = useCallback((user) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
  }, []);

  return {
    selectedUser,
    isFormModalOpen,
    isDeleteModalOpen,
    isPasswordModalOpen,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openPasswordModal,
    closeFormModal,
    closeDeleteModal,
    closePasswordModal,
  };
};

export default useUserModals;
