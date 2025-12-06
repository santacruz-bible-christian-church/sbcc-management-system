// frontend/src/features/announcement/components/AnnouncementFilters.jsx
import { HiSearch, HiFilter } from 'react-icons/hi';
import { AUDIENCE_OPTIONS } from '../utils/constants';

const AnnouncementFilters = ({
  searchQuery,
  setSearchQuery,
  audienceFilter,
  setAudienceFilter,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A]"
          />
        </div>

        {/* Audience Filter */}
        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A]"
        >
          <option value="">All Audiences</option>
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A]"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="expired">Expired</option>
        </select>
      </div>
    </div>
  );
};

export default AnnouncementFilters;
