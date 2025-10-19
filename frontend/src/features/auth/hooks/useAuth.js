import { useAuthStore } from '../../../store/auth.store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    clearError,
  };
};