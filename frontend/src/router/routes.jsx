import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EventsPage } from '../features/events/pages/EventsPage';

// Placeholder components for routes that don't exist yet
const ComingSoon = ({ title }) => (
  <div className="flex h-screen">
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">This feature is coming soon!</p>
      </div>
    </div>
  </div>
);

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
    path: '/events',
    element: (
      <ProtectedRoute>
        <EventsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/members',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Members Management" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Attendance Tracking" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ministries',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Ministries" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Inventory Management" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/documents',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Documents" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/support/helpdesk',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Helpdesk" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/support/contact',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Contact Support" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/docs',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Documentation" />
      </ProtectedRoute>
    ),
  },
  {
    path: '/help',
    element: (
      <ProtectedRoute>
        <ComingSoon title="Help Center" />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];