import { HiUsers, HiUserAdd, HiClock, HiStar } from 'react-icons/hi';

export function StatsCards({ statistics, loading }) {
  const stats = [
    {
      label: 'Total Visitors',
      value: statistics?.total || 0,
      icon: HiUsers,
      color: 'blue',
    },
    {
      label: 'First Time',
      value: statistics?.by_follow_up?.visited_1x || 0,
      icon: HiClock,
      color: 'amber',
    },
    {
      label: 'Second Visit',
      value: statistics?.by_follow_up?.visited_2x || 0,
      icon: HiUserAdd,
      color: 'indigo',
    },
    {
      label: 'Regular Visitors',
      value: statistics?.by_follow_up?.regular || 0,
      icon: HiStar,
      color: 'green',
    },
    {
      label: 'Converted to Members',
      value: statistics?.converted_to_members || 0,
      icon: HiUserAdd,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
