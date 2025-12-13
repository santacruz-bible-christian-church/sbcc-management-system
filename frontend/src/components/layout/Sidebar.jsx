import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Package,
    FileText,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    LogOut,
    Settings,
    Heart,
    Bell,
    CheckSquare,
    Shield,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePublicSettings } from '../../features/settings/hooks/usePublicSettings';

export default function SCBCSidebar({ collapsed = false, onToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [membershipOpen, setMembershipOpen] = useState(false);
    const { settings: systemSettings } = usePublicSettings();

    // Role checks
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdminOrAbove = ['super_admin', 'admin'].includes(user?.role);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const NavButton = ({ id, icon: Icon, label, badge, isOpen, onClick, path }) => {
        const isActive = path ? location.pathname === path : false;

        return (
            <div>
                <button
                    id={id}
                    type="button"
                    onClick={() => {
                        if (onClick) {
                            onClick();
                        } else if (path) {
                            navigate(path);
                        }
                    }}
                    aria-expanded={typeof isOpen === 'boolean' ? isOpen : undefined}
                    aria-controls={typeof isOpen === 'boolean' ? `${id}-submenu` : undefined}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-md ${
                        isActive ? 'bg-orange-50 text-[#FDB54A]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={collapsed ? label : undefined}
                >
                    <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-[#FDB54A]' : 'text-gray-600'} />
                        {!collapsed && <span className="font-medium">{label}</span>}
                    </div>
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            {badge && (
                                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>
                            )}
                            {typeof isOpen === 'boolean' && (
                                isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                            )}
                        </div>
                    )}
                </button>
            </div>
        );
    };

    const SubLink = ({ id, path, children }) => {
        const isActive = location.pathname === path;

        if (collapsed) return null;

        return (
            <button
                onClick={() => navigate(path)}
                className={`block w-full text-left px-4 py-2 pl-14 transition-colors rounded-md ${
                    isActive ? 'text-[#FDB54A] font-medium bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
                {children}
            </button>
        );
    };

    // Get user initials for avatar
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

    // Get app name initials for logo
    const getAppInitials = () => {
        if (!systemSettings?.app_name) return 'SC';
        const words = systemSettings.app_name.split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return systemSettings.app_name.substring(0, 2).toUpperCase();
    };

    return (
        <aside
            className={`${
                collapsed ? 'w-20' : 'w-72'
            } h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
                    {/* Dynamic Logo or Initials */}
                    {systemSettings?.logo ? (
                        <img
                            src={systemSettings.logo}
                            alt="Logo"
                            className="w-8 h-8 rounded-full object-contain flex-shrink-0 shadow-lg"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F6C67E] to-[#FDB54A] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-sm">{getAppInitials()}</span>
                        </div>
                    )}
                    {!collapsed && (
                        <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[180px]">
                            {systemSettings?.app_name || 'SBCC Management'}
                        </h1>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${collapsed ? 'hidden' : ''}`}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <Menu size={20} /> : <X size={20} />}
                </button>
            </div>

            {/* Collapsed State Toggle Button */}
            {collapsed && (
                <button
                    onClick={onToggle}
                    className="mx-auto my-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Expand sidebar"
                    title="Expand sidebar"
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2" style={{ fontSize: 'clamp(0.8rem, 1vw + 0.2rem, 1rem)' }}>
                <div className="space-y-1">
                    <NavButton
                        id="dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                        path="/dashboard"
                    />

                    <NavButton
                        id="events"
                        icon={Calendar}
                        label="Events"
                        path="/events"
                    />

                    <NavButton
                        id="announcements"
                        icon={Bell}
                        label="Announcements"
                        path="/announcements"
                    />

                    <div className="mt-1">
                        <NavButton
                            id="membership"
                            icon={Users}
                            label="Membership"
                            isOpen={!collapsed && membershipOpen}
                            onClick={!collapsed ? () => setMembershipOpen(!membershipOpen) : undefined}
                            path={collapsed ? '/members' : undefined}
                        />

                        {!collapsed && (
                            <div
                                id="membership-submenu"
                                role="region"
                                aria-labelledby="membership"
                                className={`${membershipOpen ? 'block' : 'hidden'} mt-1 space-y-1`}
                            >
                                <SubLink id="membership-list" path="/members">Members List</SubLink>
                                <SubLink id="membership-attendance" path="/attendance">Attendance</SubLink>
                                <SubLink id="membership-ministries" path="/ministries">Ministries</SubLink>
                            </div>
                        )}
                    </div>

                    <NavButton
                        id="prayer-requests"
                        icon={Heart}
                        label="Prayer Requests"
                        path="/prayer-requests"
                    />

                    <NavButton
                        id="inventory"
                        icon={Package}
                        label="Inventory"
                        path="/inventory"
                    />

                    <NavButton
                        id="documents"
                        icon={FileText}
                        label="Documents"
                        path="/documents"
                    />

                    <NavButton
                        id="tasks"
                        icon={CheckSquare}
                        label="Tasks"
                        path="/tasks"
                    />



                    <NavButton
                        id="help"
                        icon={HelpCircle}
                        label="Help Center"
                        path="/help"
                    />
                </div>
            </nav>

            {/* Footer - User Info, Settings & Logout */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                {/* User Info */}
                <div className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    collapsed ? 'justify-center' : ''
                }`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getUserInitials()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.first_name && user?.last_name
                                    ? `${user.first_name} ${user.last_name}`
                                    : user?.email || 'User'
                                }
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.role === 'super_admin' ? 'Super Admin' : user?.email || 'user@sbcc.com'}
                            </p>
                        </div>
                    )}
                </div>

                {/* User Management - Super Admin Only */}
                {isSuperAdmin && (
                    <button
                        onClick={() => navigate('/user-management')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors rounded-lg hover:bg-amber-50 text-amber-700 ${
                            location.pathname === '/user-management' ? 'bg-amber-50 text-amber-700' : ''
                        } ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'User Management' : undefined}
                    >
                        <Shield size={18} className={`flex-shrink-0 ${location.pathname === '/user-management' ? 'text-amber-600' : 'text-amber-600'}`} />
                        {!collapsed && <span className="font-medium">User Management</span>}
                    </button>
                )}

                {/* Settings Button - Admin & Super Admin */}
                {isAdminOrAbove && (
                    <button
                        onClick={() => navigate('/settings')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors rounded-lg hover:bg-gray-50 text-gray-700 ${
                            location.pathname === '/settings' ? 'bg-orange-50 text-[#FDB54A]' : ''
                        } ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? 'Settings' : undefined}
                    >
                        <Settings size={18} className={`flex-shrink-0 ${location.pathname === '/settings' ? 'text-[#FDB54A]' : 'text-gray-600'}`} />
                        {!collapsed && <span className="font-medium">Settings</span>}
                    </button>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 ${
                        collapsed ? 'justify-center' : ''
                    }`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
