const AnnouncementSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse"
        >
          {/* Status badges */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />

          {/* Metadata */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementSkeleton;
