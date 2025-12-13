import { STATS_CARDS } from '../utils/constants';

const StatsCards = ({ announcements = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS_CARDS.map((stat) => {
        const Icon = stat.icon;
        const count = announcements.filter(stat.filterFn).length;

        return (
          <div
            key={stat.id}
            className="bg-white rounded-lg shadow p-4 border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
              <Icon className="w-8 h-8" style={{ color: stat.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
