import { useState, useMemo, useRef, useEffect } from 'react';
import { Edit, Trash2, Key, UserCheck, UserX } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useUserModals } from '../hooks/useUserModals';
import { useUserActions } from '../hooks/useUserActions';
import { UserFormModal } from '../components/UserFormModal';
import { DeleteUserModal } from '../components/DeleteUserModal';
import { SetPasswordModal } from '../components/SetPasswordModal';
import { UserManagementSkeleton } from '../components/UserManagementSkeleton';
import { UserManagementToolbar } from '../components/UserManagementToolbar';

const getRoleBadgeColor = (role) => {
  const colors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    pastor: 'bg-green-100 text-green-800',
    ministry_leader: 'bg-amber-100 text-amber-800',
    member: 'bg-gray-100 text-gray-600',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

const formatRole = (role) => {
  return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const hasInitialLoad = useRef(false);

  // Build query params
  const queryParams = useMemo(() => {
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (roleFilter) params.role = roleFilter;
    if (statusFilter === 'active') params.is_active = true;
    if (statusFilter === 'inactive') params.is_active = false;
    return params;
  }, [searchTerm, roleFilter, statusFilter]);

  // Data and mutations
  const {
    users,
    isLoading,
    error,
    refetch,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
    isDeleting,
    setPassword,
    isSettingPassword,
    toggleActive,
    isTogglingActive,
  } = useUsers(queryParams);

  // Modal state
  const {
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
  } = useUserModals();

  // Action handlers
  const {
    handleFormSubmit,
    handleDeleteConfirm,
    handleSetPassword,
    handleToggleActive,
  } = useUserActions({
    createUser,
    updateUser,
    deleteUser,
    setPassword,
    toggleActive,
    closeFormModal,
    closeDeleteModal,
    closePasswordModal,
    selectedUser,
  });

  // Track initial load
  useEffect(() => {
    if (!isLoading && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
    }
  }, [isLoading]);

  // Show skeleton only on very first load
  if (isLoading && !hasInitialLoad.current) {
    return <UserManagementSkeleton />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Actions Bar */}
      <UserManagementToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={refetch}
        onAddUser={openCreateModal}
      />

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">Failed to load users. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      {!error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.first_name?.[0] || '?'}{user.last_name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={isTogglingActive}
                          className={`inline-flex items-center gap-1 text-sm cursor-pointer hover:opacity-80 transition-opacity ${
                            user.is_active ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title="Click to toggle status"
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck size={16} />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={16} />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Role Permissions</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li><strong>Super Admin:</strong> Full system access, user management, all settings</li>
          <li><strong>Admin:</strong> Full access except user management</li>
          <li><strong>Pastor:</strong> Full access to ministry features</li>
          <li><strong>Ministry Leader:</strong> Limited to their assigned ministry</li>
        </ul>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
        isDeleting={isDeleting}
      />

      <SetPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        onSubmit={handleSetPassword}
        user={selectedUser}
        isSubmitting={isSettingPassword}
      />
    </div>
  );
};

export default UserManagementPage;
