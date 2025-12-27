import { useState, useEffect, useRef } from 'react';
import { HiSearch, HiX } from 'react-icons/hi';
import { VISITOR_STATUS_OPTIONS, FOLLOW_UP_STATUS_OPTIONS } from '../utils/constants';
import { useDebounce } from '../../../hooks/useDebounce';

export function VisitorsFilters({ filters, onFilterChange, onReset }) {
  // Local search state for immediate UI feedback
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounced search value
  const debouncedSearch = useDebounce(localSearch, 400);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Sync local search with filters prop when it changes externally (e.g. reset)
  useEffect(() => {
    if (filters.search !== undefined) {
      setLocalSearch(filters.search || '');
    }
  }, [filters.search]);

  // Trigger API search when debounced value changes
  useEffect(() => {
    // Skip initial mount to avoid unnecessary API call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update if the debounced search is different from current filter
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value });
  };

  const handleFollowUpChange = (e) => {
    onFilterChange({ follow_up_status: e.target.value });
  };

  const handleClear = () => {
    setLocalSearch('');
    onReset();
  };

  const hasActiveFilters = localSearch || filters.status || filters.follow_up_status;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent bg-white"
          >
            <option value="">All Statuses</option>
            {VISITOR_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Follow-up Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.follow_up_status || ''}
            onChange={handleFollowUpChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent bg-white"
          >
            <option value="">All Follow-ups</option>
            {FOLLOW_UP_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiX className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default VisitorsFilters;
