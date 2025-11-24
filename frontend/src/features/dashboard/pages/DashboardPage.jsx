import { useAuth } from '../../auth/hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useDashboardActivities } from '../hooks/useDashboardActivities';
import { DashboardHeader } from '../components/DashboardHeader';
import { WelcomeCard } from '../components/WelcomeCard';
import { SBCCInfoCard } from '../components/SBCCInfoCard';
import { StatsGrid } from '../components/StatsGrid';
import { RecentActivities } from '../components/RecentActivities';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { stats, loading, error, refreshing, refresh, retry } = useDashboardStats();
  const activities = useDashboardActivities(stats);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sbcc-cream">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sbcc-primary border-t-transparent mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader refreshing={refreshing} onRefresh={refresh} />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <WelcomeCard user={user} />
          <SBCCInfoCard stats={stats} />
          <StatsGrid stats={stats} />
          <RecentActivities
            activities={activities}
            refreshing={refreshing}
            onRefresh={refresh}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
