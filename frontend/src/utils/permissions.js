/**
 * Permission utilities for role-based access control
 *
 * Write access is restricted to admin and super_admin roles only.
 * All authenticated users retain read access.
 */

/** Roles that have write (create/edit/delete) permissions */
export const WRITE_ROLES = ['super_admin', 'admin', 'pastor'];

/** Roles that have read access to the dashboard */
export const DASHBOARD_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

/** Module-specific write roles (override default WRITE_ROLES) */
export const MODULE_WRITE_ROLES = {
  prayer_requests: ['super_admin', 'admin', 'pastor'],
  ministries: ['super_admin', 'admin', 'ministry_leader'],
  ministry_details: ['super_admin', 'admin', 'ministry_leader'],
  settings: ['super_admin', 'admin'],
};

export const getWriteRolesForModule = (moduleKey) => {
  return MODULE_WRITE_ROLES[moduleKey] || WRITE_ROLES;
};

/**
 * Check if user has write permissions
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user can create/edit/delete
 */
export const canWrite = (user) => {
  if (!user?.role) return false;
  return WRITE_ROLES.includes(user.role);
};

/**
 * Check if user has module-specific write permissions
 * @param {Object} user - User object with role property
 * @param {string} moduleKey - Module identifier
 * @returns {boolean} True if user can create/edit/delete for module
 */
export const canWriteForModule = (user, moduleKey) => {
  if (!user?.role) return false;
  const roles = getWriteRolesForModule(moduleKey);
  return roles.includes(user.role);
};

/**
 * Check if user has a specific role
 * @param {Object} user - User object with role property
 * @param {string|string[]} roles - Role or array of roles to check
 * @returns {boolean} True if user has one of the specified roles
 */
export const hasRole = (user, roles) => {
  if (!user?.role) return false;
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

/**
 * Check if user is a super admin
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is super_admin
 */
export const isSuperAdmin = (user) => {
  return user?.role === 'super_admin';
};

/**
 * Check if user is an admin (admin or super_admin)
 * @param {Object} user - User object with role property
 * @returns {boolean} True if user is admin or super_admin
 */
export const isAdmin = (user) => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};
