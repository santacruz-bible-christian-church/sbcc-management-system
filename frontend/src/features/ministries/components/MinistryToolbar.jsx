import { useState, useRef, useEffect, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiSearch,
  HiX,
  HiOfficeBuilding,
  HiUserGroup,
  HiCalendar,
  HiClipboardCheck,
} from 'react-icons/hi';

// Stats display component
const MinistryStats = ({ stats, loading }) => {
  const items = [
    { key: 'total', label: 'Ministries', value: stats.total_ministries, icon: HiOfficeBuilding, color: 'text-gray-700' },
    { key: 'members', label: 'Members', value: stats.total_members, icon: HiUserGroup, color: 'text-blue-600' },
    { key: 'shifts', label: 'Active Shifts', value: stats.active_shifts, icon: HiCalendar, color: 'text-emerald-600' },
    { key: 'assignments', label: 'Assignments', value: stats.total_assignments, icon: HiClipboardCheck, color: 'text-amber-600' },
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

export const MinistryToolbar = ({
  stats,
  statsLoading,
  searchTerm,
  onSearchChange,
  onCreateClick,
  canManage,
}) => {
  // Debounce search
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: Stats + Actions */}
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        <MinistryStats stats={stats} loading={statsLoading} />

        {canManage && (
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] transition-colors"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>New Ministry</span>
          </button>
        )}
      </div>

      {/* Row 2: Search */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Search ministries..."
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
      </div>
    </div>
  );
};

export default MinistryToolbar;
