import { HiRefresh } from 'react-icons/hi';

export const DashboardHeader = ({ refreshing, onRefresh }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      {/* Date and Live Status */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 px-3 py-1.5 bg-white text-sbcc-primary rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200 disabled:opacity-50 hover:shadow-md text-sm"
      >
        <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
};
