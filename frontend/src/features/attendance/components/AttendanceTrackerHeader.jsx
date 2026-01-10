import { formatDate } from '../utils/formatDate';

export const AttendanceTrackerHeader = ({
  sheet,
  isMultiSelectMode,
  onToggleMultiSelectMode,
}) => {
  if (!sheet) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {sheet.event_title || 'Event'}
            </h2>
            <p className="text-sm text-gray-500">{formatDate(sheet.date)}</p>
          </div>
          <button
            onClick={onToggleMultiSelectMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMultiSelectMode
                ? 'bg-[#FDB54A] text-white hover:bg-[#e5a43d]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isMultiSelectMode ? '✓ Multi-Select' : 'Select'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        <div className="px-5 py-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{sheet.total_expected || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Members</p>
        </div>
        <div className="px-5 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{sheet.total_attended || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Present</p>
        </div>
        <div className="px-5 py-3 text-center">
          <p className="text-2xl font-bold text-[#FDB54A]">
            {sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : '0%'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Attendance Rate</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrackerHeader;
