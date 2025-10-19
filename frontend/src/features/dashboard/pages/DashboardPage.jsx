import { Button, Card } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { HiUser, HiLogout } from 'react-icons/hi';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.first_name || user?.username}!
            </p>
          </div>
          <Button color="failure" onClick={handleLogout}>
            <HiLogout className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <HiUser className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                {user?.role}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Total Members
            </h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>
          
          <Card>
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Active Events
            </h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>
          
          <Card>
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Ministries
            </h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>
          
          <Card>
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Today's Attendance
            </h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>
        </div>

        {/* Quick Actions */}
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
      </div>
    </div>
  );
};