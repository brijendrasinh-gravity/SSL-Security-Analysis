import { useContext } from 'react';
import { UserContext } from '../context/usercontext';

export const usePermission = () => {
  const { user } = useContext(UserContext);

  /**
   * Check if user has a specific permission for a module
   * @param {string} moduleName - The module name (e.g., 'user', 'role', 'ssl_scan')
   * @param {string} action - The action to check (e.g., 'canList', 'canCreate', 'canModify', 'canDelete')
   * @returns {boolean} - True if user has permission, false otherwise
   */
  const hasPermission = (moduleName, action) => {
    // If no user is logged in, deny access
    if (!user) return false;

    // If user is admin, grant all permissions
    if (user.role?.is_Admin) return true;

    // Check if user has permissions array
    if (!user.permissions || !Array.isArray(user.permissions)) return false;

    // Find the permission for the specific module
    const modulePermission = user.permissions.find(
      (perm) => perm.module_name === moduleName
    );

    // Return the specific action permission
    return modulePermission?.[action] || false;
  };

  /**
   * Check if user has any permission for a module (used to show/hide entire module)
   * @param {string} moduleName - The module name
   * @returns {boolean} - True if user has at least one permission
   */
  const hasAnyPermission = (moduleName) => {
    if (!user) return false;
    if (user.role?.is_Admin) return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;

    const modulePermission = user.permissions.find(
      (perm) => perm.module_name === moduleName
    );

    if (!modulePermission) return false;

    // Check if user has at least one permission
    return (
      modulePermission.canList ||
      modulePermission.canCreate ||
      modulePermission.canModify ||
      modulePermission.canDelete
    );
  };

  /**
   * Check if user is admin
   * @returns {boolean} - True if user is admin
   */
  const isAdmin = () => {
    return user?.role?.is_Admin || false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    isAdmin,
  };
};
