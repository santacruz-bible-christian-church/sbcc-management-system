import { Navigate } from 'react-router-dom';
import { ProtectedWithLayout } from './ProtectedWithLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { ComingSoon } from '../components/ui/ComingSoon';

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
