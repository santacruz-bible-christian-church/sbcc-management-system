import { useNavigate } from 'react-router-dom';
import { HiSparkles, HiUsers, HiCalendar } from 'react-icons/hi';

export const WelcomeCard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-8">
      <div className="relative bg-gradient-to-br from-sbcc-orange via-sbcc-primary to-sbcc-primary rounded-3xl p-8 overflow-hidden shadow-xl h-full min-h-[280px] group hover:shadow-2xl transition-shadow">
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <HiSparkles className="w-8 h-8 text-white animate-pulse" />
            <span className="text-white text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Welcome Back{user?.first_name ? `, ${user.first_name}` : ''}!
          </h2>

          <p className="text-white/90 text-lg max-w-xl mb-6">
            Here's what's happening with your church today. Track members, manage events, and stay organized.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/members')}
              className="bg-white text-sbcc-primary font-medium py-2.5 px-5 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <HiUsers className="w-5 h-5" />
              View Members
            </button>
            <button
              onClick={() => navigate('/events')}
              className="bg-white/20 text-white font-medium py-2.5 px-5 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center gap-2 backdrop-blur-sm hover:scale-105"
            >
              <HiCalendar className="w-5 h-5" />
              Manage Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
