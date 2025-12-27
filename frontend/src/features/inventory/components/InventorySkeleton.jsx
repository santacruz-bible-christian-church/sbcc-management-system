const InventorySkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Breakdown Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-56 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-8" />
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Skeleton */}
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 min-w-[200px]" />
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-10 bg-gray-200 rounded-lg w-32" />
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-20" />
            ))}
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border-b border-gray-100 px-6 py-4">
            <div className="flex gap-4 items-center">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { InventorySkeleton };
export default InventorySkeleton;
