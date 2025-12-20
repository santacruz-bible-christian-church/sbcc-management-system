import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

// Route to page title mapping
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/announcements': 'Announcements',
  '/members': 'Members',
  '/visitors': 'Visitors',
  '/attendance': 'Attendance',
  '/attendance/tracker': 'Attendance Tracker',
  '/ministries': 'Ministries',
  '/prayer-requests': 'Prayer Requests',
  '/inventory': 'Inventory',
  '/documents': 'Documents',
  '/tasks': 'Tasks',
  '/help': 'Help Center',
  '/help/guides': 'Guides',
  '/help/faqs': 'FAQs',
  '/settings': 'Settings',
  '/user-management': 'User Management',
};

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get page title from route
  const getPageTitle = () => {
    // Check for exact match first
    if (PAGE_TITLES[location.pathname]) {
      return PAGE_TITLES[location.pathname];
    }
    // Check for ministry details page
    if (location.pathname.startsWith('/ministries/')) {
      return 'Ministry Details';
    }
    return 'Dashboard';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Role checks
  const isSuperAdmin = user?.role === 'super_admin';

  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left Section - Page Title */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Help Link */}
        <button
          onClick={() => navigate('/help')}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            location.pathname.startsWith('/help') ? 'bg-orange-50 text-[#FDB54A]' : 'text-gray-600'
          }`}
          title="Help Center"
        >
          <HelpCircle size={20} />
        </button>

        {/* Settings Link */}
        <button
          onClick={() => navigate('/settings')}
          className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
            location.pathname === '/settings' ? 'bg-orange-50 text-[#FDB54A]' : 'text-gray-600'
          }`}
          title="Settings"
        >
          <Settings size={20} />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials()}
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.role === 'super_admin'
                        ? 'Super Admin'
                        : user?.role?.replace('_', ' ') || 'User'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                {/* User Management - Super Admin Only */}
                {isSuperAdmin && (
                  <button
                    onClick={() => handleNavigation('/user-management')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <Shield size={18} />
                    <span>User Management</span>
                  </button>
                )}

                {/* Settings */}
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} />
                  <span>Profile Settings</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-gray-100"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
