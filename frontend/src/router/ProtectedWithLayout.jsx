import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';

/**
 * ProtectedWithLayout - Wrapper to apply MainLayout to protected routes
 */
export const ProtectedWithLayout = ({ children, requiredRole, requiredRoles }) => (
  <ProtectedRoute requiredRole={requiredRole} requiredRoles={requiredRoles}>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

export default ProtectedWithLayout;
