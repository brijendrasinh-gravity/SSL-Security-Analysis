import { Navigate } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

/**
 * Route-level permission guard
 * Checks if user has permission to access a route
 * If not, shows access denied message
 */
function PermissionGuard({ children, moduleName, requiredPermission = 'canList' }) {
  const { hasPermission, hasAnyPermission, isAdmin } = usePermission();

  // Admin bypass - admins can access everything
  if (isAdmin()) {
    return children;
  }

  // Check if user has the required permission
  const hasAccess = requiredPermission 
    ? hasPermission(moduleName, requiredPermission)
    : hasAnyPermission(moduleName);

  // If no access, show access denied
  if (!hasAccess) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center p-5">
          <ShieldAlert size={48} className="mb-3" />
          <h4 className="fw-bold">Access Denied</h4>
          <p className="mb-0">
            You don't have permission to access this page.
            <br />
            Please contact your administrator if you need access.
          </p>
        </Alert>
      </Container>
    );
  }

  return children;
}

export default PermissionGuard;
