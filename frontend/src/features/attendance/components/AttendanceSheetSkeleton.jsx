// Skeleton loading component for attendance sheet cards
export const AttendanceSheetSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSheetSkeleton;
