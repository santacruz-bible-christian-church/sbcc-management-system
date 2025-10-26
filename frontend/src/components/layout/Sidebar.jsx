import { useState } from 'react';
import {
	LayoutDashboard,
	Calendar,
	Lock,
	Package,
	FileText,
	Headphones,
	File,
	Layers,
	HelpCircle,
	ChevronDown,
	ChevronUp,
} from 'lucide-react';

export default function SCBCSidebar() {
	const [membershipOpen, setMembershipOpen] = useState(false);
	const [supportOpen, setSupportOpen] = useState(false);
	const [activeId, setActiveId] = useState('dashboard');

	const NavButton = ({ id, icon: Icon, label, badge, isOpen, onClick, active }) => {
		const isActive = active || activeId === id;
		return (
		<div>
			<button
				id={id}
				type="button"
				onClick={() => {
					if (onClick) onClick();
					setActiveId(id);
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

	const SubLink = ({ id, children }) => (
		<a
			href="#"
			onClick={() => setActiveId(id)}
				className={`block w-full text-left px-4 py-2 pl-14 transition-colors ${
					activeId === id ? 'text-[#FDB54A] font-medium' : 'text-gray-600 hover:bg-gray-50'
				}`}
		>
			{children}
		</a>
	);

	return (
		<aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
						<div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
					</div>
					<h1 className="text-lg font-semibold text-gray-900">SCBC Management</h1>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-hidden py-2 px-1" style={{ fontSize: 'clamp(0.8rem, 1vw + 0.2rem, 1rem)' }}>
				<div className="px-2">
									<NavButton
										id="dashboard"
										icon={LayoutDashboard}
										label="Dashboard"
									/>

					<NavButton id="calendar" icon={Calendar} label="Events" />

					<div className="mt-1">
						<NavButton
							id="membership"
							icon={Lock}
							label="Membership"
							isOpen={membershipOpen}
							onClick={() => setMembershipOpen(!membershipOpen)}
						/>

						<div
							id="membership-submenu"
							role="region"
							aria-labelledby="membership"
							className={`${membershipOpen ? 'block' : 'hidden'} bg-gray-50 rounded-md mt-1`}
						>
							<SubLink id="membership-list">List</SubLink>
							<SubLink id="membership-attendance">Attendance</SubLink>
							<SubLink id="membership-kanban">Kanban</SubLink>
						</div>
					</div>

					<NavButton id="inventory" icon={Package} label="Inventory" />

					<NavButton id="documents" icon={FileText} label="Documents" />

					<div className="mt-1">
						<NavButton id="support" icon={Headphones} label="Support" isOpen={supportOpen} onClick={() => setSupportOpen(!supportOpen)} />
						<div id="support-submenu" role="region" aria-labelledby="support" className={`${supportOpen ? 'block' : 'hidden'} bg-gray-50 rounded-md mt-1`}>
							<SubLink id="support-helpdesk">Helpdesk</SubLink>
							<SubLink id="support-contact">Contact</SubLink>
						</div>
					</div>

					<div className="my-3 border-t border-gray-200"></div>

					<NavButton id="docs" icon={File} label="Docs" />
					<NavButton id="components" icon={Layers} label="Components" />
					<NavButton id="help" icon={HelpCircle} label="Help" />
				</div>
			</nav>

			{/* Banner removed per request */}
		</aside>
	);
}

