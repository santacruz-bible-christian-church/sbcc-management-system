import { useState, useRef, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlineUpload,
  HiSearch,
  HiX,
  HiChevronDown,
  HiCheckCircle,
  HiUsers,
  HiUserAdd,
  HiUserRemove,
  HiArchive,
} from 'react-icons/hi';
import { useMinistries } from '../../ministries/hooks/useMinistries';

// Inline stats component
const MemberStats = ({ stats }) => {
  const items = [
    { key: 'total', label: 'Total', value: stats.total, icon: HiUsers, color: 'text-gray-700' },
    { key: 'active', label: 'Active', value: stats.active, icon: HiUserAdd, color: 'text-emerald-600' },
    { key: 'inactive', label: 'Inactive', value: stats.inactive, icon: HiUserRemove, color: 'text-gray-500' },
    { key: 'archived', label: 'Archived', value: stats.archived, icon: HiArchive, color: 'text-amber-600' },
  ];

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
      <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
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

export const MemberToolbar = ({
  stats,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  onCreateClick,
  onImportClick,
  selectionMode,
  onToggleSelectionMode,
  canManage,
}) => {
  const { ministries, loading: ministriesLoading } = useMinistries();

  // Dropdown states
  const [statusOpen, setStatusOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [ministryOpen, setMinistryOpen] = useState(false);

  // Refs for click outside handling
  const statusRef = useRef(null);
  const genderRef = useRef(null);
  const ministryRef = useRef(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) setStatusOpen(false);
      if (genderRef.current && !genderRef.current.contains(event.target)) setGenderOpen(false);
      if (ministryRef.current && !ministryRef.current.contains(event.target)) setMinistryOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const ministryOptions = (ministries || []).map(m => ({
    value: m.id.toString(),
    label: m.name,
  }));

  const handleClearFilters = () => {
    setFilters({ gender: '', ministry: '', status: '' });
    setSearchTerm('');
  };

  const hasActiveFilters = filters.gender || filters.ministry || filters.status || searchTerm;

  return (
    <div className="space-y-3">
      {/* Row 1: Stats + Actions */}
      <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        {/* Left: Stats */}
        <MemberStats stats={stats} />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-3 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] transition-colors"
                title="Add new member"
              >
                <HiOutlinePlus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Member</span>
              </button>

              <button
                onClick={onImportClick}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                title="Import CSV"
              >
                <HiOutlineUpload className="w-5 h-5" />
                <span className="hidden sm:inline">Import</span>
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              <button
                onClick={onToggleSelectionMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  selectionMode
                    ? 'bg-[#FDB54A] text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <HiCheckCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{selectionMode ? 'Exit Selection' : 'Select'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Search + Filters */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <FilterDropdown
          label="All Status"
          value={filters.status}
          options={statusOptions}
          onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          dropdownRef={statusRef}
          isOpen={statusOpen}
          setIsOpen={setStatusOpen}
        />

        {/* Gender Filter */}
        <FilterDropdown
          label="Gender"
          value={filters.gender}
          options={genderOptions}
          onChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
          dropdownRef={genderRef}
          isOpen={genderOpen}
          setIsOpen={setGenderOpen}
        />

        {/* Ministry Filter */}
        <FilterDropdown
          label="Ministry"
          value={filters.ministry}
          options={ministryOptions}
          onChange={(value) => setFilters(prev => ({ ...prev, ministry: value }))}
          dropdownRef={ministryRef}
          isOpen={ministryOpen}
          setIsOpen={setMinistryOpen}
        />

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

export default MemberToolbar;
