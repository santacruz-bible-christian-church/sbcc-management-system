import { HiLightningBolt, HiUsers, HiCalendar, HiChevronRight } from 'react-icons/hi';

export const SBCCInfoCard = ({ stats }) => {
  return (
    <div className="lg:col-span-4">
      <div className="bg-gradient-to-br from-sbcc-orange to-sbcc-primary rounded-3xl p-6 shadow-xl text-white h-full min-h-[280px] flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-shadow">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-1000" />
        </div>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
            <HiLightningBolt className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">SBCC Management System</h3>
          <p className="text-white/90 text-sm leading-relaxed">
            A comprehensive digital platform designed to streamline church operations by efficiently managing member records, events, ministries, inventory, and communications all in one place.
          </p>

          {/* Quick Stats Mini Cards */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <HiUsers className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Members</span>
              </div>
              <p className="text-lg font-bold text-white">{stats?.overview?.total_members || 0}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <HiCalendar className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Events</span>
              </div>
              <p className="text-lg font-bold text-white">{stats?.overview?.upcoming_events || 0}</p>
            </div>
          </div>
        </div>

        <button className="relative z-10 w-full bg-white text-sbcc-primary font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 mt-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105">
          Learn More
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
