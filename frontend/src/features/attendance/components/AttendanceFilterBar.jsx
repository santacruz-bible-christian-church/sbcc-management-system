import PropTypes from 'prop-types';
import { Search } from 'lucide-react';

const ACCENT = '#FDB54A';

export default function AttendanceFilterBar({
  query,
  onQueryChange,
  ministryFilter,
  onMinistryChange,
  ministries,
  onClearFilters,
  onSave,
  hasChanges,
  saving,
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="pl-3 pr-2">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search members..."
            className="flex-1 py-2 px-2 outline-none text-sm text-gray-700"
            disabled={disabled || saving}
          />
          <button
            className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium rounded-r-lg disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
            disabled={disabled || saving}
          >
            Search
          </button>
        </div>
      </div>

      {/* Ministry filter + Clear */}
      <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="flex items-center justify-center px-3 py-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#FDB54A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h8" />
          </svg>
        </div>

        <select
          value={ministryFilter}
          onChange={(e) => onMinistryChange(e.target.value)}
          className="bg-transparent px-4 py-2 text-sm text-gray-600 outline-none border-0 min-w-[160px] cursor-pointer"
          disabled={disabled || saving}
        >
          <option value="">All Ministries</option>
          {ministries.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-[#FDB54A] text-white text-sm font-medium rounded-r-lg disabled:opacity-50"
          disabled={disabled || saving}
        >
          Clear
        </button>
      </div>

      {/* Save Changes */}
      <div>
        <button
          onClick={onSave}
          disabled={!hasChanges || saving || disabled}
          className={`px-4 py-2 text-white text-sm font-medium rounded-lg shadow-md transition-opacity ${
            !hasChanges || saving || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ backgroundColor: ACCENT }}
        >
          {saving ? 'Saving...' : hasChanges ? 'Save Changes *' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

AttendanceFilterBar.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  ministryFilter: PropTypes.string.isRequired,
  onMinistryChange: PropTypes.func.isRequired,
  ministries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};
