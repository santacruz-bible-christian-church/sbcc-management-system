/**
 * Skeleton loader for User Management page
 * Matches the users table layout
 */
const UserManagementSkeleton = () => {
  const SkeletonRow = () => (
    <tr className="border-b border-gray-100">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Actions Bar Skeleton */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card Skeleton */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export { UserManagementSkeleton };
export default UserManagementSkeleton;
