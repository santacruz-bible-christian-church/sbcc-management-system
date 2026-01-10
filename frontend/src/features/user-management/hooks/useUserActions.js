import { useCallback } from 'react';

/**
 * Hook for User Management page action handlers
 */
export const useUserActions = ({
  createUser,
  updateUser,
  deleteUser,
  setPassword,
  toggleActive,
  closeFormModal,
  closeDeleteModal,
  closePasswordModal,
  selectedUser,
}) => {
  const handleFormSubmit = useCallback((data) => {
    if (selectedUser) {
      updateUser({ id: selectedUser.id, data }, {
        onSuccess: () => closeFormModal(),
      });
    } else {
      createUser(data, {
        onSuccess: () => closeFormModal(),
      });
    }
  }, [selectedUser, createUser, updateUser, closeFormModal]);

  const handleDeleteConfirm = useCallback((id) => {
    deleteUser(id, {
      onSuccess: () => closeDeleteModal(),
    });
  }, [deleteUser, closeDeleteModal]);

  const handleSetPassword = useCallback(({ id, password }) => {
    setPassword({ id, password }, {
      onSuccess: () => closePasswordModal(),
    });
  }, [setPassword, closePasswordModal]);

  const handleToggleActive = useCallback((user) => {
    toggleActive(user.id);
  }, [toggleActive]);

  return {
    handleFormSubmit,
    handleDeleteConfirm,
    handleSetPassword,
    handleToggleActive,
  };
};

export default useUserActions;
