import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EventsPage } from '../features/events/pages/EventsPage';

// Placeholder component for routes that don't exist yet
const ComingSoon = ({ title }) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">This feature is coming soon!</p>
    </div>
  </div>
);

// Wrapper to apply MainLayout to protected routes
const ProtectedWithLayout = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
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
      <ProtectedWithLayout>
        <DashboardPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/events',
    element: (
      <ProtectedWithLayout>
        <EventsPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/members',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Members Management" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Attendance Tracking" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/ministries',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Ministries" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Inventory Management" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/documents',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Documents" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/support/helpdesk',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Helpdesk" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/support/contact',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Contact Support" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/docs',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Documentation" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/help',
    element: (
      <ProtectedWithLayout>
        <ComingSoon title="Help Center" />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];