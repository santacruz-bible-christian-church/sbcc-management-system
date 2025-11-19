import { HiOutlineFilter, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import { SecondaryButton } from '../../../components/ui/Button';
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
    <section className="rounded-3xl border border-sbcc-gray/20 bg-white px-6 py-5 shadow-[0_12px_40px_rgba(56,56,56,0.08)] print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-sbcc-light-orange/60 px-4 py-2 text-sm font-semibold text-sbcc-dark">
          <HiOutlineFilter className="h-5 w-5" />
          Smart filters
        </div>
        <SecondaryButton
          size="sm"
          icon={HiOutlineX}
          onClick={onReset}
          className="text-sbcc-dark"
        >
          Clear filters
        </SecondaryButton>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="text-xs font-semibold uppercase text-sbcc-gray">Search assets</span>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-sbcc-gray/30 bg-sbcc-cream px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-[color:var(--sbcc-primary)]">
            <HiOutlineSearch className="h-5 w-5 text-sbcc-gray" />
            <input
              type="search"
              value={search}
              onChange={handleSearchInput}
              placeholder="Item name, description, remarks..."
              className="w-full bg-transparent text-sm text-sbcc-dark placeholder:text-sbcc-gray focus:outline-none"
            />
          </div>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-sbcc-gray">Status</span>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-2 w-full rounded-2xl border border-sbcc-gray/30 bg-sbcc-cream px-4 py-2 text-sm text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-sbcc-gray">Label</span>
          <select
            name="label"
            value={filters.label}
            onChange={handleFilterChange}
            className="mt-2 w-full rounded-2xl border border-sbcc-gray/30 bg-sbcc-cream px-4 py-2 text-sm text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          >
            {LABEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase text-sbcc-gray">Ministry</span>
          <select
            name="ministry"
            value={filters.ministry}
            onChange={handleFilterChange}
            className="mt-2 w-full rounded-2xl border border-sbcc-gray/30 bg-sbcc-cream px-4 py-2 text-sm text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
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
