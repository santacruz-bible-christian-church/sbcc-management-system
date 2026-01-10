export const AttendanceBulkActionsBar = ({
  selectedCount,
  onMarkPresent,
  onMarkAbsent,
  onToggle,
  onClear,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-blue-900">
          {selectedCount} {selectedCount === 1 ? 'member' : 'members'} selected
        </p>
        <div className="flex gap-2">
          <button
            onClick={onMarkPresent}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Mark Present
          </button>
          <button
            onClick={onMarkAbsent}
            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Mark Absent
          </button>
          <button
            onClick={onToggle}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Toggle
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceBulkActionsBar;
