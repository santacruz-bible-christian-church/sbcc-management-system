import { useAuthStore } from '../store/auth.store';
import {
  canWrite,
  canWriteForModule,
  hasRole,
  isSuperAdmin,
  isAdmin,
  WRITE_ROLES,
  DASHBOARD_ROLES,
  MODULE_WRITE_ROLES,
} from '../utils/permissions';

/**
 * Hook for permission checks based on current user
 *
 * @returns {Object} Permission check functions and flags
 *
 * @example
 * const { canWrite, isSuperAdmin, user } = usePermissions();
 * if (canWrite) {
 *   // Show create/edit/delete buttons
 * }
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    /** True if user can create/edit/delete (admin or super_admin only) */
    canWrite: canWrite(user),
    /** True if user is super_admin */
    isSuperAdmin: isSuperAdmin(user),
    /** True if user is admin or super_admin */
    isAdmin: isAdmin(user),
    /** Check if user has specific role(s) */
    hasRole: (roles) => hasRole(user, roles),
    /** Check if user has module-specific write access */
    canWriteForModule: (moduleKey) => canWriteForModule(user, moduleKey),
    /** User's current role */
    role: user?.role || null,
  };
};

export { WRITE_ROLES, DASHBOARD_ROLES, MODULE_WRITE_ROLES };
export default usePermissions;
