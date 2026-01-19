/**
 * Dashboard Skeleton - Loading placeholder for dashboard page
 */
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sbcc-cream via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Welcome Card Skeleton */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          {/* Info Card Skeleton */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="col-span-8">
            {/* Total Members Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-10 bg-gray-200 rounded w-16 mx-auto mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart + Stats Grid */}
            <div className="flex mt-4 gap-4">
              {/* Pie Chart Skeleton */}
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto" />
              </div>

              {/* Stats Grid Skeleton */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                    <div className="h-8 bg-gray-200 rounded w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities Skeleton */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-36 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Widgets Skeleton */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
