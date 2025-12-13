import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../../api/users.api';
import toast from 'react-hot-toast';

const USERS_QUERY_KEY = ['users'];

export const useUsers = (params = {}) => {
  const queryClient = useQueryClient();

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => usersApi.getUsers(params),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success('User created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.email?.[0]
        || error.response?.data?.username?.[0]
        || error.response?.data?.detail
        || 'Failed to create user';
      toast.error(message);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.email?.[0]
        || error.response?.data?.username?.[0]
        || error.response?.data?.detail
        || 'Failed to update user';
      toast.error(message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error
        || error.response?.data?.detail
        || 'Failed to delete user';
      toast.error(message);
    },
  });

  // Set password mutation
  const setPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => usersApi.setPassword(id, password),
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error
        || error.response?.data?.detail
        || 'Failed to set password';
      toast.error(message);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id) => usersApi.toggleActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success(data.message || 'User status updated');
    },
    onError: (error) => {
      const message = error.response?.data?.error
        || error.response?.data?.detail
        || 'Failed to toggle user status';
      toast.error(message);
    },
  });

  // Parse users - handle both array and paginated response
  const users = Array.isArray(usersData) ? usersData : usersData?.results || [];

  return {
    users,
    isLoading,
    error,
    refetch,
    // Mutations
    createUser: createUserMutation.mutate,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
    setPassword: setPasswordMutation.mutate,
    isSettingPassword: setPasswordMutation.isPending,
    toggleActive: toggleActiveMutation.mutate,
    isTogglingActive: toggleActiveMutation.isPending,
  };
};
