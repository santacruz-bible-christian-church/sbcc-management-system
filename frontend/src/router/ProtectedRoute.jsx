import { Navigate } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../features/auth/hooks/useAuth';

// Roles allowed to access the dashboard
const DASHBOARD_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

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

  // Check for specific required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for multiple allowed roles
  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
