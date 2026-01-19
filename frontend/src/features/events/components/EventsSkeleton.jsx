/**
 * Events Skeleton - Loading placeholder for events page
 */
export const EventsSkeleton = () => {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="space-y-6">
        {/* Toolbar Skeleton */}
        <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 bg-gray-200 rounded-lg w-24" /> {/* View Toggle */}
              <div className="h-10 bg-gray-200 rounded-lg w-10" /> {/* Filter */}
              <div className="h-10 bg-gray-200 rounded-lg w-10" /> {/* Refresh */}
            </div>
            <div className="flex items-center gap-3">
              {/* Summary Stats */}
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-full w-16" />
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-32" /> {/* Create Button */}
            </div>
          </div>
        </div>

        {/* Calendar + Sidebar Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Calendar Skeleton */}
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-8" />
                <div className="h-8 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-8" />
              </div>
            </div>

            {/* Calendar Grid Header (Days) */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>

            {/* Calendar Grid (5 weeks) */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-lg p-2"
                >
                  <div className="h-4 bg-gray-200 rounded w-6 mb-2" />
                  {i % 5 === 0 && (
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            {/* Selected Date Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsSkeleton;
