import { useState } from 'react';
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { STATUS_METADATA, EVENT_TYPE_OPTIONS } from '../utils/constants';

const selectClass =
  'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all cursor-pointer appearance-none min-w-[120px]';

const inputClass =
  'px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all';

export default function EventsFilters({
  id = 'events-filters',
  open,
  filters,
  searchDraft,
  ordering,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  onOrderingChange,
  onReset,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!open) return null;

  const hasActiveFilters =
    searchDraft ||
    filters.event_type ||
    filters.status ||
    filters.ministry ||
    filters.start_date ||
    filters.end_date;

  const hasAdvancedFilters =
    filters.ministry ||
    filters.start_date ||
    filters.end_date;

  // Auto-apply on filter change
  const handleFilterWithSubmit = (e) => {
    onFilterChange(e);
    // Trigger search after a brief delay for auto-apply
    setTimeout(() => onSearchSubmit(), 100);
  };

  const handleOrderingWithSubmit = (value) => {
    onOrderingChange(value);
    setTimeout(() => onSearchSubmit(), 100);
  };

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200"
    >
      {/* Basic Filters Row */}
      <div className="p-3 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="events-search"
            type="search"
            className={`${inputClass} pl-9 w-full`}
            placeholder="Search events..."
            value={searchDraft}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit(e)}
          />
        </div>

        {/* Event Type */}
        <select
          id="events-type-filter"
          name="event_type"
          className={selectClass}
          value={filters.event_type}
          onChange={handleFilterWithSubmit}
        >
          <option value="">All Types</option>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          id="events-status-filter"
          name="status"
          className={selectClass}
          value={filters.status}
          onChange={handleFilterWithSubmit}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_METADATA).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </select>

        {/* Order By */}
        <select
          id="events-ordering-filter"
          className={selectClass}
          value={ordering}
          onChange={(e) => handleOrderingWithSubmit(e.target.value)}
        >
          <option value="-date">Newest first</option>
          <option value="date">Oldest first</option>
          <option value="-created_at">Recently added</option>
          <option value="title">Title A-Z</option>
        </select>

        {/* Advanced Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showAdvanced || hasAdvancedFilters
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Advanced
          {hasAdvancedFilters && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />}
          {showAdvanced ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
        </button>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all filters"
          >
            <HiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters (Collapsible) */}
      {showAdvanced && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100 bg-gray-50/50">
          <div className="pt-3 flex items-center gap-3 flex-wrap">
            {/* Ministry */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Ministry</label>
              <input
                id="events-ministry-filter"
                name="ministry"
                type="number"
                className={`${inputClass} w-20`}
                placeholder="ID"
                value={filters.ministry}
                onChange={handleFilterWithSubmit}
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">From</label>
              <input
                id="events-start-filter"
                name="start_date"
                type="date"
                className={inputClass}
                value={filters.start_date}
                onChange={handleFilterWithSubmit}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">To</label>
              <input
                id="events-end-filter"
                name="end_date"
                type="date"
                className={inputClass}
                value={filters.end_date}
                onChange={handleFilterWithSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
