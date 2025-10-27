import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Package,
    FileText,
    Headphones,
    File,
    Layers,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Building2,
    ClipboardCheck,
} from 'lucide-react';

export default function SCBCSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [membershipOpen, setMembershipOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

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
                >
                    <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-[#FDB54A]' : 'text-gray-600'} />
                        <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>
                        )}
                        {typeof isOpen === 'boolean' && (
                            isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                    </div>
                </button>
            </div>
        );
    };

    const SubLink = ({ id, path, children }) => {
        const isActive = location.pathname === path;
        
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

    return (
        <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#F6C67E] to-[#FDB54A] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">SC</span>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900">SBCC Management</h1>
                </div>
            </div>

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

                    <div className="mt-1">
                        <NavButton
                            id="membership"
                            icon={Users}
                            label="Membership"
                            isOpen={membershipOpen}
                            onClick={() => setMembershipOpen(!membershipOpen)}
                        />

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
                    </div>

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

                    <div className="my-3 border-t border-gray-200"></div>

                    <div className="px-2 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Support & Resources
                        </p>
                    </div>

                    <div className="mt-1">
                        <NavButton 
                            id="support" 
                            icon={Headphones} 
                            label="Support" 
                            isOpen={supportOpen} 
                            onClick={() => setSupportOpen(!supportOpen)} 
                        />
                        <div 
                            id="support-submenu" 
                            role="region" 
                            aria-labelledby="support" 
                            className={`${supportOpen ? 'block' : 'hidden'} mt-1 space-y-1`}
                        >
                            <SubLink id="support-helpdesk" path="/support/helpdesk">Helpdesk</SubLink>
                            <SubLink id="support-contact" path="/support/contact">Contact</SubLink>
                        </div>
                    </div>

                    <NavButton 
                        id="docs" 
                        icon={File} 
                        label="Documentation"
                        path="/docs"
                    />
                    
                    <NavButton 
                        id="help" 
                        icon={HelpCircle} 
                        label="Help Center"
                        path="/help"
                    />
                </div>
            </nav>

            {/* Footer - User Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        JG
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@sbcc.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

