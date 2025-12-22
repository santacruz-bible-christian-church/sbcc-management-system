import { useState, useRef, useEffect, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiSearch,
  HiX,
  HiChevronDown,
  HiCalendar,
  HiClipboardList,
  HiUserGroup,
  HiTrendingUp,
} from 'react-icons/hi';

// Stats display component
const AttendanceStats = ({ stats, loading }) => {
  const items = [
    { key: 'total', label: 'Total Sheets', value: stats.total_sheets, icon: HiClipboardList, color: 'text-gray-700' },
    { key: 'month', label: 'This Month', value: stats.this_month, icon: HiCalendar, color: 'text-blue-600' },
    { key: 'records', label: 'Records', value: stats.total_records, icon: HiUserGroup, color: 'text-emerald-600' },
    { key: 'rate', label: 'Avg Rate', value: `${stats.average_attendance_rate || 0}%`, icon: HiTrendingUp, color: 'text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map((stat, index) => (
        <div key={stat.key} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-300">•</span>}
          <stat.icon className={`w-4 h-4 mr-1.5 ${stat.color}`} />
          <span className="text-sm font-medium text-gray-900">{stat.value}</span>
          <span className="text-sm text-gray-500 ml-1">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

// Filter dropdown component
const FilterDropdown = ({ label, value, options, onChange, dropdownRef, isOpen, setIsOpen }) => (
  <div className="relative" ref={dropdownRef}>
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors min-w-[100px]"
    >
      <span className="text-gray-700 truncate">
        {value ? options.find(o => o.value === value)?.label : label}
      </span>
      <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    {isOpen && (
      <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]">
        <ul className="py-1">
          <li>
            <button
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {label}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.value}>
              <button
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value ? 'bg-amber-50 text-amber-700' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export const AttendanceToolbar = ({
  stats,
  statsLoading,
  searchTerm,
  onSearchChange,
  eventFilter,
  onEventFilterChange,
  events = [],
  onCreateClick,
}) => {
  // Dropdown states
  const [eventOpen, setEventOpen] = useState(false);
  const eventRef = useRef(null);

  // Debounce search
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearch(value);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timeout
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (eventRef.current && !eventRef.current.contains(event.target)) setEventOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const eventOptions = events.map(e => ({
    value: e.id.toString(),
    label: e.title,
  }));

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onEventFilterChange('');
  };

  const hasActiveFilters = eventFilter || searchTerm;

  return (
    <div className="space-y-3">
      {/* Row 1: Stats + Actions */}
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        {/* Left: Stats */}
        <AttendanceStats stats={stats} loading={statsLoading} />

        {/* Right: Create Button */}
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>New Sheet</span>
        </button>
      </div>

      {/* Row 2: Search + Filters */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search by event..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all"
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(''); onSearchChange(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Event Filter */}
        {events.length > 0 && (
          <FilterDropdown
            label="All Events"
            value={eventFilter}
            options={eventOptions}
            onChange={onEventFilterChange}
            dropdownRef={eventRef}
            isOpen={eventOpen}
            setIsOpen={setEventOpen}
          />
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all filters"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceToolbar;
