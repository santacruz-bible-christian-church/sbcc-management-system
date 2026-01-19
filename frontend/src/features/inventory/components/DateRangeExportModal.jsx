import { useState } from 'react';
import { HiOutlineCalendar, HiOutlineDownload, HiX } from 'react-icons/hi';

/**
 * Date range filter modal for inventory PDF export
 */
export const DateRangeExportModal = ({ open, onClose, onExport, loading }) => {
  const [rangeType, setRangeType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!open) return null;

  const getDateRange = () => {
    const today = new Date();
    let startDate = null;
    let endDate = new Date(today.setHours(23, 59, 59, 999));

    switch (rangeType) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : null;
        endDate = customEnd ? new Date(customEnd) : null;
        break;
      default:
        // 'all' - no date filter
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  const handleExport = () => {
    const { startDate, endDate } = getDateRange();
    onExport({ startDate, endDate, rangeType });
  };

  const rangeOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <HiOutlineCalendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Export PDF Report</h3>
              <p className="text-sm text-gray-500">Filter by acquisition date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Range Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setRangeType(option.value)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                  rangeType === option.value
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {rangeType === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || (rangeType === 'custom' && (!customStart || !customEnd))}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <HiOutlineDownload className="w-4 h-4" />
            {loading ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeExportModal;
