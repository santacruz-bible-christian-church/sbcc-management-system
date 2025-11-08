import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { dashboardApi } from '../../../api/dashboard.api';
import { HiUsers, HiCube, HiCalendar, HiClipboardList, HiSparkles, HiClock, HiTrendingUp } from 'react-icons/hi';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-sbcc-cream">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-sbcc-primary border-t-transparent mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats?.overview?.total_members || 500,
      change: '+12%',
      icon: HiUsers,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Church Materials',
      value: stats?.overview?.total_inventory || 50,
      change: '+8%',
      icon: HiCube,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Scheduled Events',
      value: stats?.overview?.upcoming_events || 15,
      change: '+21%',
      icon: HiCalendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Pending Tasks',
      value: 24,
      change: '+5%',
      icon: HiClipboardList,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    }
  ];

  const recentActivities = [
    {
      title: 'New Member Added',
      description: 'John Doe joined the congregation',
      time: '2 hours ago',
      icon: HiUsers,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Event Created',
      description: 'Sunday Service scheduled',
      time: '5 hours ago',
      icon: HiCalendar,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Inventory Updated',
      description: 'Added new church supplies',
      time: '1 day ago',
      icon: HiCube,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sbcc-cream to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sbcc-dark">Dashboard</h1>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Welcome Card - Full width on mobile, spans 8 cols on desktop */}
          <div className="lg:col-span-8">
            <div className="relative bg-gradient-to-br from-sbcc-orange via-sbcc-primary to-sbcc-primary rounded-3xl p-8 overflow-hidden shadow-xl h-full min-h-[280px]">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <HiSparkles className="w-8 h-8 text-white" />
                  <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Welcome Back{user?.first_name ? `, ${user.first_name}` : ''}!
                </h2>

                <p className="text-white/90 text-lg max-w-xl">
                  Here's what's happening with your church today. Track members, manage events, and stay organized.
                </p>
              </div>
            </div>
          </div>

          {/* Info Card - Spans 4 cols on desktop, appears below welcome on mobile */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-sbcc-orange to-sbcc-primary rounded-3xl p-6 shadow-xl text-white h-full min-h-[280px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <HiSparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">SBCC Management System</h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  A digital platform designed to streamline church operations by efficiently managing member records, events, finances, and communications.
                </p>
              </div>

              <button className="w-full bg-white text-sbcc-primary font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 mt-4">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Grid - Spans 8 cols on desktop */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.iconBg}`}>
                      <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <HiTrendingUp className="w-4 h-4" />
                      {card.change}
                    </div>
                  </div>

                  <div>
                    <p className="text-sbcc-gray text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-sbcc-dark">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities - Spans 4 cols on desktop */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-sbcc-dark">Recent Activities</h3>
                <button className="text-sm text-sbcc-primary hover:text-sbcc-orange font-medium transition-colors">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className={`p-2 rounded-lg ${activity.iconBg} flex-shrink-0`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sbcc-dark truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-sbcc-gray mt-0.5">{activity.description}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <HiClock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
