import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

export const TaskFilters = ({
  open,
  filters,
  searchDraft,
  ordering,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  onOrderingChange,
  onReset,
}) => {
  if (!open) return null;

  return (
    <div className="bg-white rounded-lg shadow-[0_24px_60px_rgba(31,41,55,0.12)] p-6">
      <form onSubmit={onSearchSubmit} className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-sbcc-dark mb-2">
            Search Tasks
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, description, or notes..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-orange focus:border-transparent"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sbcc-gray" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-sbcc-dark mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-orange focus:border-transparent cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-sbcc-dark mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={onFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-orange focus:border-transparent cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-sbcc-dark mb-2">
              Sort By
            </label>
            <select
              value={ordering}
              onChange={(e) => onOrderingChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-orange focus:border-transparent cursor-pointer"
            >
              <option value="-priority,end_date">Priority (High to Low)</option>
              <option value="priority,end_date">Priority (Low to High)</option>
              <option value="end_date">Due Date (Earliest)</option>
              <option value="-end_date">Due Date (Latest)</option>
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={onReset}
              className="w-full px-4 py-2.5 bg-sbcc-light-orange text-sbcc-dark font-medium rounded-lg hover:bg-sbcc-orange/20 transition-colors flex items-center justify-center gap-2"
            >
              <HiOutlineX className="h-5 w-5" />
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
