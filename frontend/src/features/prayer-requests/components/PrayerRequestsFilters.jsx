import React from 'react';
import { HiViewGrid, HiViewList } from 'react-icons/hi';
import { PRAYER_CATEGORY_OPTIONS, PRAYER_PRIORITY_OPTIONS } from '../utils/constants';

const PrayerRequestsFilters = ({
  search,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search requests…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
        />

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20 cursor-pointer"
        >
          <option value="">All Priorities</option>
          {PRAYER_PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20 cursor-pointer"
        >
          <option value="">All Categories</option>
          {PRAYER_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* View Mode */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              viewMode === 'grid'
                ? 'bg-white text-[#FFB84D] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiViewGrid className="text-lg" /> Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1 ${
              viewMode === 'list'
                ? 'bg-white text-[#FFB84D] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <HiViewList className="text-lg" /> List
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerRequestsFilters;
