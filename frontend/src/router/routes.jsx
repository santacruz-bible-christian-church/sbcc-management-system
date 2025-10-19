import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];