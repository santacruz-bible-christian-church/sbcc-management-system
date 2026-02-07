
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiCalendar, HiArrowRight } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';

// Time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Format today's date
const getTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

export const WelcomeCard = ({ user, stats }) => {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const todayDate = getTodayDate();

  // Get contextual info from stats
  const upcomingEvents = stats?.overview?.upcoming_events || 0;
  const pendingTasks = stats?.overview?.pending_tasks || 0;

  return (
    <div className="lg:col-span-8">
      <div className="bg-sbcc-primary rounded-2xl p-8 shadow-md h-full min-h-[200px] flex flex-col justify-between relative overflow-hidden group">

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1 tracking-wide uppercase">{todayDate}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                {greeting}, {user?.first_name || 'User'}
              </h1>
              <p className="text-white/90 max-w-lg leading-relaxed text-lg">
                {upcomingEvents > 0 || pendingTasks > 0 ? (
                  <span>
                    You have <strong className="text-white border-b-2 border-white/30">{pendingTasks} active tasks</strong> and <strong className="text-white border-b-2 border-white/30">{upcomingEvents} upcoming events</strong> on your schedule.
                  </span>
                ) : (
                   "Your schedule is clear. Have a blessed day!"
                )}
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex items-center gap-3 mt-2 md:mt-0">
               <button
                  onClick={() => navigate('/members')}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-sbcc-primary text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
               >
                  <HiUsers className="w-5 h-5" />
                  <span>Members</span>
               </button>
               <button
                  onClick={() => navigate('/events')}
                  className="flex items-center gap-2 px-5 py-3 bg-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm"
               >
                  <HiCalendar className="w-5 h-5" />
                  <span>Events</span>
               </button>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Circle to break the solidity slightly without noise */}
        <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};
