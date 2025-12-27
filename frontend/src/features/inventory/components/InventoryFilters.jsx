import { HiOutlineFilter, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { LABEL_OPTIONS, STATUS_OPTIONS } from '../utils';

export const InventoryFilters = ({
  filters,
  search,
  onSearchChange,
  onFilterChange,
  onReset,
  ministryOptions,
}) => {
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    onFilterChange?.(name, value);
  };

  const handleSearchInput = (event) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
          <HiOutlineFilter className="h-4 w-4" />
          Smart filters
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiOutlineX className="h-4 w-4" />
          Clear filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="text-xs font-medium uppercase text-gray-500">Search assets</span>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
            <HiOutlineSearch className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              type="search"
              value={search}
              onChange={handleSearchInput}
              placeholder="Item name, description, remarks..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 border-none outline-none focus:ring-0 focus:outline-none"
            />
          </div>
        </label>

        <label>
          <span className="text-xs font-medium uppercase text-gray-500">Status</span>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium uppercase text-gray-500">Label</span>
          <select
            name="label"
            value={filters.label}
            onChange={handleFilterChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {LABEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium uppercase text-gray-500">Ministry</span>
          <select
            name="ministry"
            value={filters.ministry}
            onChange={handleFilterChange}
            className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All ministries</option>
            {ministryOptions.map((ministry) => (
              <option key={ministry} value={ministry}>
                {ministry}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};

export default InventoryFilters;
