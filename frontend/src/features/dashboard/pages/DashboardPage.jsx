import { useEffect, useState } from 'react';
import { Spinner, Alert } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../api/dashboard.api';
import { 
  HiUser, 
  HiLogout, 
  HiRefresh, 
  HiUsers,
  HiCalendar,
  HiOfficeBuilding,
  HiClipboardCheck,
  HiPlus,
  HiDocumentReport,
} from 'react-icons/hi';
import { Card, StatsCard } from '../../../components/ui/Card';
import { Button, PrimaryButton, SecondaryButton } from '../../../components/ui/Button';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sbcc-cream">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sbcc-primary border-t-transparent mb-4" />
        <p className="text-sbcc-gray">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sbcc-cream via-white to-sbcc-light-orange">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card variant="gradient" className="shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <HiUser className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Welcome back, {stats?.user?.name || user?.username}!
                  </h1>
                  <p className="text-white/80 text-sm mt-1">
                    {stats?.user?.email}
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mt-2 backdrop-blur-sm">
                    {stats?.user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <SecondaryButton 
                  onClick={fetchStats}
                  className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 text-white border-white/30"
                  icon={HiRefresh}
                >
                  Refresh
                </SecondaryButton>
                <Button 
                  variant="danger"
                  onClick={handleLogout}
                  className="flex-1 md:flex-none"
                  icon={HiLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6">
            <span className="font-medium">Error!</span> {error}
          </Alert>
        )}

        {/* Stats Grid - Admin/Pastor Only */}
        {stats?.overview && (user?.role === 'admin' || user?.role === 'pastor') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Members"
              value={stats.overview.total_members || 0}
              change={`${stats.overview.active_members || 0} active`}
              icon={HiUsers}
              variant="gradient"
            />
            
            <StatsCard
              title="Upcoming Events"
              value={stats.overview.upcoming_events || 0}
              change="This month"
              icon={HiCalendar}
              variant="orange"
            />
            
            <StatsCard
              title="Ministries"
              value={stats.overview.total_ministries || 0}
              change="Active ministries"
              icon={HiOfficeBuilding}
              variant="default"
            />
            
            {stats.attendance && (
              <StatsCard
                title="Today's Attendance"
                value={stats.attendance.today || 0}
                change={`${stats.attendance.this_week || 0} this week`}
                icon={HiClipboardCheck}
                variant="default"
              />
            )}
          </div>
        )}

        {/* Personal Stats - Member View */}
        {stats?.personal && (
          <Card 
            title="My Information"
            className="mb-8 hover:shadow-lg transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-sbcc-light-orange rounded-lg">
                <p className="text-sbcc-gray text-sm font-medium mb-1">Ministry</p>
                <p className="text-sbcc-dark font-bold text-lg">
                  {stats.personal.ministry || 'Not assigned'}
                </p>
              </div>
              <div className="p-4 bg-sbcc-light-orange rounded-lg">
                <p className="text-sbcc-gray text-sm font-medium mb-1">Status</p>
                <p className="text-sbcc-dark font-bold text-lg capitalize">
                  {stats.personal.status}
                </p>
              </div>
              <div className="p-4 bg-sbcc-light-orange rounded-lg">
                <p className="text-sbcc-gray text-sm font-medium mb-1">Attendance</p>
                <p className="text-sbcc-dark font-bold text-lg">
                  {stats.personal.my_attendance_count} times
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Events */}
        {stats?.upcoming_events && stats.upcoming_events.length > 0 && (
          <Card 
            title="Upcoming Events"
            subtitle="Don't miss these important events"
            className="mb-8"
          >
            <div className="space-y-3">
              {stats.upcoming_events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-center justify-between p-4 bg-sbcc-light-orange hover:bg-sbcc-orange/30 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-sbcc-gradient rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiCalendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sbcc-dark">{event.title}</p>
                      <p className="text-sm text-sbcc-gray">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })} • {event.event_type}
                      </p>
                      {event.location && (
                        <p className="text-xs text-sbcc-gray mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                  <SecondaryButton size="sm">
                    View Details
                  </SecondaryButton>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State for Events */}
        {stats?.upcoming_events?.length === 0 && (
          <Card className="mb-8 text-center py-12">
            <HiCalendar className="h-16 w-16 text-sbcc-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-sbcc-dark mb-2">
              No Upcoming Events
            </h3>
            <p className="text-sbcc-gray mb-4">
              There are no events scheduled at the moment.
            </p>
            {(user?.role === 'admin' || user?.role === 'pastor') && (
              <PrimaryButton icon={HiPlus}>
                Create Event
              </PrimaryButton>
            )}
          </Card>
        )}

        {/* Quick Actions - Admin Only */}
        {(user?.role === 'admin' || user?.role === 'pastor') && (
          <Card 
            title="Quick Actions"
            subtitle="Common tasks and shortcuts"
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all transform hover:scale-105 text-left group">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HiUsers className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Member</h4>
                <p className="text-xs text-gray-600">Register new member</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all transform hover:scale-105 text-left group">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HiCalendar className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Create Event</h4>
                <p className="text-xs text-gray-600">Schedule new event</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all transform hover:scale-105 text-left group">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HiClipboardCheck className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Attendance</h4>
                <p className="text-xs text-gray-600">Mark attendance</p>
              </button>

              <button className="p-6 bg-gradient-to-br from-sbcc-light-orange to-sbcc-orange hover:from-sbcc-orange hover:to-sbcc-primary rounded-lg transition-all transform hover:scale-105 text-left group">
                <div className="w-12 h-12 bg-sbcc-primary rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HiDocumentReport className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Reports</h4>
                <p className="text-xs text-gray-600">View analytics</p>
              </button>
            </div>
          </Card>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-sbcc-gray mt-8">
          <p>Last updated: {new Date(stats?.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};