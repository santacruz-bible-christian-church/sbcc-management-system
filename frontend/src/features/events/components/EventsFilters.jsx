import { PrimaryButton, Button } from '../../../components/ui/Button';
import { STATUS_METADATA, EVENT_TYPE_OPTIONS } from '../utils/constants';

const labelClass =
  'events-field-label text-xs font-semibold uppercase tracking-wide text-sbcc-dark/70';

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
  if (!open) return null;

  return (
    <div id={id} className="events-filters">
      <form className="grid gap-4" onSubmit={onSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="events-search">
              Search
            </label>
            <input
              id="events-search"
              type="search"
              className="events-input"
              placeholder="Title, description, or location"
              value={searchDraft}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="events-type-filter">
              Event Type
            </label>
            <select
              id="events-type-filter"
              name="event_type"
              className="events-input"
              value={filters.event_type}
              onChange={onFilterChange}
            >
              <option value="">All types</option>
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="events-status-filter">
              Status
            </label>
            <select
              id="events-status-filter"
              name="status"
              className="events-input"
              value={filters.status}
              onChange={onFilterChange}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_METADATA).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="events-ordering-filter">
              Order By
            </label>
            <select
              id="events-ordering-filter"
              className="events-input"
              value={ordering}
              onChange={(event) => onOrderingChange(event.target.value)}
            >
              <option value="-date">Newest date</option>
              <option value="date">Oldest date</option>
              <option value="-created_at">Recently created</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass} htmlFor="events-ministry-filter">
              Ministry ID
            </label>
            <input
              id="events-ministry-filter"
              name="ministry"
              type="number"
              className="events-input"
              placeholder="e.g. 4"
              value={filters.ministry}
              onChange={onFilterChange}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="events-start-filter">
              Start Date
            </label>
            <input
              id="events-start-filter"
              name="start_date"
              type="date"
              className="events-input"
              value={filters.start_date}
              onChange={onFilterChange}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="events-end-filter">
              End Date
            </label>
            <input
              id="events-end-filter"
              name="end_date"
              type="date"
              className="events-input"
              value={filters.end_date}
              onChange={onFilterChange}
            />
          </div>

          <div className="flex items-end gap-3">
            <PrimaryButton type="submit" className="flex-1">
              Apply
            </PrimaryButton>
            <Button type="button" variant="secondary" className="flex-1" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
