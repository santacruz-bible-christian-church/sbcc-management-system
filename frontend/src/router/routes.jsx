import { Navigate } from 'react-router-dom';
import { ProtectedWithLayout } from './ProtectedWithLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EventsPage } from '../features/events/pages/EventsPage';
import { MembershipListPage } from '../features/members/pages/MembershipListPage';
import { MinistriesPage } from '../features/ministries/pages/MinistriesPage';
import { MinistryDetailsPage } from '../features/ministries/pages/MinistryDetailsPage';
import AttendanceSheetPage from '../features/attendance/pages/AttendanceSheetPage';
import AttendanceTracker from '../features/attendance/pages/AttendanceTracker';
import { ComingSoon } from '../components/ui/ComingSoon';
import Inventory from '../features/inventory/pages/Inventory';
import AnnouncementPage from '../features/announcement/pages/AnnouncementPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import PrayerRequestsPage from '../features/prayer-requests/pages/PrayerRequestsPage';
import PrayerRequestsDetails from '../features/prayer-requests/pages/PrayerRequestsDetails';
import { FileManagementPage } from '../features/file-management/pages/FileManagementPage';
import { TasksPage } from '../features/tasks/pages/TasksPage';
import HelpCenter from '../features/help/pages/HelpCenter';
import GuidesDirectory from '../features/help/components/GuidesDirectory';
import FAQsDirectory from '../features/help/components/FAQsDirectory';
import { UserManagementPage } from '../features/user-management/pages/UserManagementPage';
import { UnauthorizedPage } from '../components/ui/UnauthorizedPage';
import { VisitorsPage } from '../features/visitors/pages/VisitorsPage';

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
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
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
        <FileManagementPage />
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
        <HelpCenter />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/help/guides',
    element: (
      <ProtectedWithLayout>
        <GuidesDirectory />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/help/faqs',
    element: (
      <ProtectedWithLayout>
        <FAQsDirectory />
      </ProtectedWithLayout>
    ),
  },
  {
    path: "/announcements",
    element: (
      <ProtectedWithLayout>
        <AnnouncementPage />
      </ProtectedWithLayout>
    )
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
    path: '/prayer-requests',
    element: (
      <ProtectedWithLayout>
        <PrayerRequestsPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/prayer-requests/:id',
    element: (
      <ProtectedWithLayout>
        <PrayerRequestsDetails />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/tasks',
    element: (
      <ProtectedWithLayout>
        <TasksPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/visitors',
    element: (
      <ProtectedWithLayout>
        <VisitorsPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '/user-management',
    element: (
      <ProtectedWithLayout requiredRoles={['super_admin']}>
        <UserManagementPage />
      </ProtectedWithLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
