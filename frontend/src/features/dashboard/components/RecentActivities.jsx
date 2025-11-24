import { useNavigate } from 'react-router-dom';
import { HiRefresh, HiClock, HiSparkles } from 'react-icons/hi';

export const RecentActivities = ({ activities, refreshing, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-4">
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-sbcc-dark">Recent Activities</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 24 hours</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="text-sm text-sbcc-primary hover:text-sbcc-orange font-medium transition-colors flex items-center gap-1 disabled:opacity-50 hover:scale-105"
          >
            <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => (
            <button
              key={index}
              onClick={() => activity.link && navigate(activity.link)}
              disabled={!activity.link}
              className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-left disabled:cursor-default group border border-transparent hover:border-gray-200"
            >
              <div className={`p-2 rounded-lg ${activity.iconBg} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sbcc-dark truncate group-hover:text-sbcc-primary transition-colors">
                  {activity.title}
                </p>
                <p className="text-xs text-sbcc-gray mt-0.5 truncate">{activity.description}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <HiClock className="w-3 h-3" />
                  {activity.time}
                </div>
              </div>
            </button>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <HiSparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activities</p>
            <p className="text-xs mt-1">Activities will appear here as they happen</p>
          </div>
        )}
      </div>
    </div>
  );
};
