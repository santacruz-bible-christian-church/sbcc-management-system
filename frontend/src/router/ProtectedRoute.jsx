import { Navigate } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../features/auth/hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
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

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};