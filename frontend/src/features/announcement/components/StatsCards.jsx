import { STATS_CARDS } from '../utils/constants';

const StatsCards = ({ announcements = [], inline = false }) => {
  // Inline display for unified toolbar
  if (inline) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {STATS_CARDS.map((stat, index) => {
          const Icon = stat.icon;
          const count = announcements.filter(stat.filterFn).length;

          return (
            <div key={stat.id} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-300">•</span>}
              <Icon className="w-4 h-4 mr-1.5" style={{ color: stat.color }} />
              <span className="text-sm font-medium text-gray-900">{count}</span>
              <span className="text-sm text-gray-500 ml-1">{stat.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid display (original)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS_CARDS.map((stat) => {
        const Icon = stat.icon;
        const count = announcements.filter(stat.filterFn).length;

        return (
          <div
            key={stat.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 border-l-4"
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
