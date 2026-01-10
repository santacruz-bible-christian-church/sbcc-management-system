import {
  HiSearch,
  HiFilter,
  HiPlus,
  HiViewGrid,
  HiViewList,
  HiRefresh,
} from 'react-icons/hi';

export const FileManagementToolbar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  categories,
  currentCategory,
  onFilterChange,
  onClearFilter,
  loading,
  onRefresh,
  viewMode,
  onViewModeToggle,
  onAddNew,
}) => {
  const handleFilterDropdownChange = (e) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="bg-transparent border-b border-gray-200">
      <div className="px-8 py-6">
        <div className="flex items-stretch gap-3 h-12">
          {/* Add Button */}
          <button
            onClick={onAddNew}
            className="flex items-center justify-center aspect-square h-full bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6A635] transition-colors flex-shrink-0"
            title="Add new meeting minutes"
          >
            <HiPlus className="w-6 h-6" />
          </button>

          {/* Search Form */}
          <form onSubmit={onSearchSubmit} className="flex-1 flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 h-full">
            <div className="pl-3 pr-2">
              <HiSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search meeting minutes..."
              className="flex-1 h-full px-2 outline-none text-sm text-gray-700 border-0"
            />
            <button
              type="submit"
              className="bg-[#FDB54A] text-white px-6 h-full text-sm font-medium hover:bg-[#e5a43b] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter Dropdown */}
          <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex-shrink-0 h-full">
            <div className="flex items-center justify-center px-3">
              <HiFilter className="w-5 h-5 text-[#FDB54A]" />
            </div>
            <select
              value={currentCategory || ''}
              onChange={handleFilterDropdownChange}
              className="bg-transparent px-4 h-full text-sm text-gray-600 outline-none border-0 min-w-[140px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <button
              onClick={onClearFilter}
              className="px-4 h-full bg-[#FDB54A] text-white text-sm font-medium hover:bg-[#e5a43b] transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center h-full px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <HiRefresh className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View Toggle */}
          <button
            onClick={onViewModeToggle}
            className="flex items-center justify-center h-full px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm"
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? (
              <HiViewList className="w-5 h-5 text-gray-700" />
            ) : (
              <HiViewGrid className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileManagementToolbar;
