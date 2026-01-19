/**
 * Members Skeleton - Loading placeholder for members list page
 */
export const MembersSkeleton = () => {
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="space-y-4">
        {/* Toolbar Skeleton */}
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Stats Pills */}
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-20" />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="h-10 bg-gray-200 rounded-lg w-64" /> {/* Search */}
              <div className="h-10 bg-gray-200 rounded-lg w-32" /> {/* Filter */}
              <div className="h-10 bg-gray-200 rounded-lg w-28" /> {/* Add Button */}
            </div>
          </div>
        </div>

        {/* List Headers */}
        <div className="pr-3 pl-3 flex justify-between animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>

        {/* Member Cards Skeleton */}
        <div className="space-y-3.5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center pr-4 pl-4 py-5 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.1)] bg-white animate-pulse"
            >
              {/* Avatar + Name */}
              <div className="w-[18%] flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>

              {/* Gender */}
              <div className="w-[10%] flex justify-center">
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>

              {/* Contact */}
              <div className="w-[15%] flex justify-center">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>

              {/* Birthday */}
              <div className="w-[15%] flex justify-center">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>

              {/* Ministry */}
              <div className="w-[20%] flex justify-center">
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>

              {/* Actions */}
              <div className="w-[18%] flex justify-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="w-8 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between pt-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-10" />
            <div className="h-10 bg-gray-200 rounded w-20" />
            <div className="h-10 bg-gray-200 rounded w-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersSkeleton;
