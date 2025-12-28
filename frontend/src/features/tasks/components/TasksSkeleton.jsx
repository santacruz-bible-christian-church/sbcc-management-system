/**
 * Skeleton loader for Tasks/Kanban page
 * Matches the Kanban board column layout
 */
const TasksSkeleton = () => {
  const columns = [
    { title: 'Pending', color: 'bg-yellow-400' },
    { title: 'In Progress', color: 'bg-blue-400' },
    { title: 'Overdue', color: 'bg-red-400' },
    { title: 'Completed', color: 'bg-green-400' },
    { title: 'Cancelled', color: 'bg-gray-400' },
  ];

  const SkeletonCard = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
      {/* Priority badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-5 w-5 bg-gray-200 rounded" />
      </div>
      {/* Title */}
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      {/* Description */}
      <div className="h-4 w-full bg-gray-200 rounded mb-1" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 overflow-x-auto pb-8">
      {columns.map((column) => (
        <div
          key={column.title}
          className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4"
        >
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <span className="font-semibold text-gray-700">{column.title}</span>
            <div className="h-5 w-6 bg-gray-200 rounded-full ml-auto animate-pulse" />
          </div>
          {/* Skeleton Cards */}
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ))}
    </div>
  );
};

export { TasksSkeleton };
export default TasksSkeleton;
