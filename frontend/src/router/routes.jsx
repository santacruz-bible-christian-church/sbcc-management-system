import { Navigate } from 'react-router-dom';
import { ProtectedWithLayout } from './ProtectedWithLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { MembershipListPage } from '../features/members/pages/MembershipListPage';
import { MinistriesPage } from '../features/ministries/pages/MinistriesPage';
import { MinistryDetailsPage } from '../features/ministries/pages/MinistryDetailsPage';
import AttendanceSheetPage from '../features/attendance/pages/AttendanceSheetPage';
import AttendanceTracker from '../features/attendance/pages/AttendanceTracker';
import { ComingSoon } from '../components/ui/ComingSoon';
import Inventory from '../features/inventory/pages/Inventory';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

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
        <MembershipListPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/attendance',
    element: (
      <ProtectedWithLayout>
        <AttendanceSheetPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/attendance/tracker',
    element: (
      <ProtectedWithLayout>
        <AttendanceTracker />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/ministries',
    element: (
      <ProtectedWithLayout>
        <MinistriesPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/ministries/:id',
    element: (
      <ProtectedWithLayout>
        <MinistryDetailsPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/inventory',
    element: (
      <ProtectedWithLayout>
        <Inventory />
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
    path: '/settings',
    element: (
      <ProtectedWithLayout>
        <SettingsPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
