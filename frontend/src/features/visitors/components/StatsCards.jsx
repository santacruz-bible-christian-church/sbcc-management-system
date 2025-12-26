import { HiUsers, HiUserAdd, HiClock, HiStar } from 'react-icons/hi';

export function StatsCards({ statistics, loading, inline = false }) {
  const stats = [
    {
      label: 'Total',
      value: statistics?.total || 0,
      icon: HiUsers,
      color: 'text-gray-700',
    },
    {
      label: 'First Time',
      value: statistics?.by_follow_up?.visited_1x || 0,
      icon: HiClock,
      color: 'text-amber-600',
    },
    {
      label: 'Second Visit',
      value: statistics?.by_follow_up?.visited_2x || 0,
      icon: HiUserAdd,
      color: 'text-indigo-600',
    },
    {
      label: 'Regular',
      value: statistics?.by_follow_up?.regular || 0,
      icon: HiStar,
      color: 'text-green-600',
    },
    {
      label: 'Converted',
      value: statistics?.converted_to_members || 0,
      icon: HiUserAdd,
      color: 'text-purple-600',
    },
  ];

  // Inline display for toolbar
  if (inline) {
    if (loading) {
      return (
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-300">•</span>}
              <Icon className={`w-4 h-4 mr-1.5 ${stat.color}`} />
              <span className="text-sm font-medium text-gray-900">{stat.value}</span>
              <span className="text-sm text-gray-500 ml-1">{stat.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid display (original)
  const colorClasses = {
    'text-gray-700': 'bg-gray-50 text-gray-600',
    'text-amber-600': 'bg-amber-50 text-amber-600',
    'text-indigo-600': 'bg-indigo-50 text-indigo-600',
    'text-green-600': 'bg-green-50 text-green-600',
    'text-purple-600': 'bg-purple-50 text-purple-600',
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
