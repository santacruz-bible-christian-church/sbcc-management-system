import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardActivities } from '../hooks/useDashboardActivities';
import { WelcomeCard } from '../components/WelcomeCard';
import { DailyVerseCard } from '../components/DailyVerseCard';
import { StatsGrid } from '../components/StatsGrid';
import { RecentActivities } from '../components/RecentActivities';
import { TaskWidgets } from '../components/TaskWidgets';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import TotalMembersStatsCard from '../components/TotalMembersStatsCard';
import MinistryPieChart from '../components/MinistryPieChart';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading, error, refreshing, refresh, retry } = useDashboardStats();
  const activities = useDashboardActivities(stats);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sbcc-cream">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-sbcc-primary text-white rounded-lg hover:bg-sbcc-orange transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sbcc-cream via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <WelcomeCard user={user} stats={stats} />
          <DailyVerseCard />

          <div className="col-span-8">
            <TotalMembersStatsCard />
            <div className="flex mt-4">
              <MinistryPieChart />
              <StatsGrid stats={stats} loading={refreshing} />
            </div>
          </div>

          <RecentActivities
            activities={activities}
            refreshing={refreshing}
            onRefresh={refresh}
          />

          {/* Task Widgets - Full Width */}
          <TaskWidgets />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
