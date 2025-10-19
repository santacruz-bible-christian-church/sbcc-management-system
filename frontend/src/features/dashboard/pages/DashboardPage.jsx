import { useEffect, useState } from 'react';
import { Button, Card, Spinner, Alert } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../api/dashboard.api';
import { HiUser, HiLogout, HiRefresh } from 'react-icons/hi';

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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {stats?.user?.name || user?.username}!
            </p>
          </div>
          <div className="flex gap-2">
            <Button color="gray" onClick={fetchStats}>
              <HiRefresh className="mr-2 h-5 w-5" />
              Refresh
            </Button>
            <Button color="failure" onClick={handleLogout}>
              <HiLogout className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6">
            {error}
          </Alert>
        )}

        {/* User Info Card */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiUser className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {stats?.user?.name}
              </h2>
              <p className="text-gray-600">{stats?.user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                {stats?.user?.role}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Grid - Admin/Pastor View */}
        {stats?.overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Total Members
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stats.overview.total_members || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.overview.active_members || 0} active
              </p>
            </Card>
            
            {stats.overview.upcoming_events !== undefined && (
              <Card>
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Upcoming Events
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overview.upcoming_events}
                </p>
                {stats.overview.past_events !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.overview.past_events} past events
                  </p>
                )}
              </Card>
            )}
            
            {stats.overview.total_ministries !== undefined && (
              <Card>
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Ministries
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.overview.total_ministries}
                </p>
              </Card>
            )}
            
            {stats.attendance && (
              <Card>
                <h3 className="text-gray-500 text-sm font-medium mb-2">
                  Today's Attendance
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.attendance.today}
                </p>
                {stats.attendance.this_week !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.attendance.this_week} this week
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Personal Stats - Member View */}
        {stats?.personal && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              My Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Ministry</p>
                <p className="text-gray-900 font-medium">
                  {stats.personal.ministry || 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <p className="text-gray-900 font-medium capitalize">
                  {stats.personal.status}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Attendance Count</p>
                <p className="text-gray-900 font-medium">
                  {stats.personal.my_attendance_count} times
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Events */}
        {stats?.upcoming_events && stats.upcoming_events.length > 0 && (
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {stats.upcoming_events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {event.event_type}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button color="blue">Add Member</Button>
              <Button color="purple">Create Event</Button>
              <Button color="green">Mark Attendance</Button>
              <Button color="yellow">View Reports</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};