/**
 * Skeleton loader for File Management page
 * Matches the folder/file list layout
 */
const FileManagementSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Folders section skeleton */}
      <div>
        <div className="h-5 w-20 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Files section skeleton */}
      <div>
        <div className="h-5 w-16 bg-gray-200 rounded mb-3 animate-pulse" />
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse ml-auto" />
              <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
          {/* Table rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 animate-pulse"
            >
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { FileManagementSkeleton };
export default FileManagementSkeleton;
