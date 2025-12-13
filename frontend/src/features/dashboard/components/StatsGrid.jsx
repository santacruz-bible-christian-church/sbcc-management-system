import { HiUsers, HiCube, HiCalendar, HiClipboardList } from 'react-icons/hi';
import { StatCard } from './StatCard';

export const StatsGrid = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Inventory Items',
      value: stats?.overview?.total_inventory || 0,
      icon: HiCube,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      link: '/inventory'
    },
    {
      title: 'Upcoming Events',
      value: stats?.overview?.upcoming_events || 0,
      icon: HiCalendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      link: '/events'
    },
  ];

  if (loading) {
    return (
      <div className="lg:col-span-8 w-[40%]">
        <div className="grid grid-cols-1 gap-2 ml-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8 w-[40%]">
      <div className="grid grid-cols-1 gap-2 ml-3">
        {statCards.map((card, index) => (
          <StatCard key={index} card={card} index={index} />
        ))}
      </div>
    </div>
  );
};
