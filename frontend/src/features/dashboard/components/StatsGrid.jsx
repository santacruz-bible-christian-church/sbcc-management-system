import { HiUsers, HiCube, HiCalendar, HiClipboardList } from 'react-icons/hi';
import { StatCard } from './StatCard';

export const StatsGrid = ({ stats }) => {
  const statCards = [
    // {
    //   title: 'Total Members',
    //   value: stats?.overview?.total_members || 0,
    //   icon: HiUsers,
    //   iconBg: 'bg-blue-100',
    //   iconColor: 'text-blue-600',
    //   gradient: 'from-blue-500 to-blue-600',
    //   link: '/members'
    // },
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
    // {
    //   title: 'Active Ministries',
    //   value: stats?.overview?.total_ministries || 0,
    //   icon: HiClipboardList,
    //   iconBg: 'bg-orange-100',
    //   iconColor: 'text-orange-600',
    //   gradient: 'from-orange-500 to-orange-600',
    //   link: '/ministries'
    // }
  ];

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
