/**
 * Skeleton loader for Settings page
 * Matches the tabbed layout with preview sidebar
 */
const SettingsSkeleton = () => {
  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-6">

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>

          {/* Form Fields Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />

            {/* Input Fields */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Image Upload Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-32 w-full bg-gray-100 rounded-lg animate-pulse border-2 border-dashed border-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Preview Content */}
            <div className="space-y-4">
              <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SettingsSkeleton };
export default SettingsSkeleton;
