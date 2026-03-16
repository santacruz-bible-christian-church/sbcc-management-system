import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { DASHBOARD_ROLES } from '../utils/permissions';

const MULTIMEDIA_ALLOWED_PREFIXES = ['/announcements', '/members', '/settings'];
const DENIED_ACCESS_MESSAGE = 'Denied Access, contact admin or superadmin for concerns';

export const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has dashboard access
  if (!DASHBOARD_ROLES.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (user?.role === 'multimedia') {
    const isAllowedForMultimedia = MULTIMEDIA_ALLOWED_PREFIXES.some((pathPrefix) =>
      location.pathname.startsWith(pathPrefix)
    );
    if (!isAllowedForMultimedia) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{ deniedMessage: DENIED_ACCESS_MESSAGE }}
        />
      );
    }
  }

  // Check for specific required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ deniedMessage: DENIED_ACCESS_MESSAGE }}
      />
    );
  }

  // Check for multiple allowed roles
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ deniedMessage: DENIED_ACCESS_MESSAGE }}
      />
    );
  }

  return children;
};
