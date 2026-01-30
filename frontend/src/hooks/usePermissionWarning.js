import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { usePermissions } from './usePermissions';

/**
 * Hook that shows a one-time warning toast when user lacks write permissions
 *
 * @param {string} moduleKey - Module key for permission lookup
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to show the warning (default: true)
 * @param {number} options.duration - Toast duration in ms (default: 5000)
 * @param {string} options.label - Friendly module name for the warning message
 *
 * @returns {Object} Permission state including canWrite and user
 *
 * @example
 * const { canWrite, user } = usePermissionWarning('inventory', { label: 'Inventory' });
 * // Shows: "You have read-only access to Inventory. Contact an admin for edit permissions."
 */
export const usePermissionWarning = (moduleKey, options = {}) => {
  const { canWriteForModule, user, isSuperAdmin, isAdmin, hasRole, role } = usePermissions();
  const hasShownWarning = useRef(false);
  const { enabled = true, duration = 5000, label } = options;
  const moduleLabel = label || moduleKey;
  const canWrite = canWriteForModule(moduleKey);

  useEffect(() => {
    const warningKey = `perm_warn_${user?.id || 'anon'}_${moduleKey}`;
    const storage =
      typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
    const wasShown = storage ? storage.getItem(warningKey) : null;

    // Only show warning once per component mount, when user lacks write access
    if (enabled && !canWrite && !hasShownWarning.current && !wasShown) {
      hasShownWarning.current = true;
      if (storage) {
        storage.setItem(warningKey, '1');
      }

      toast(`You have read-only access to ${moduleLabel}. Contact an admin for edit permissions.`, {
        icon: '🔒',
        duration,
        style: {
          background: '#f59e0b',
          color: '#fff',
        },
      });
    }
  }, [canWrite, moduleLabel, enabled, duration, moduleKey, user?.id]);

  return { canWrite, user, isSuperAdmin, isAdmin, hasRole, role };
};

export default usePermissionWarning;
