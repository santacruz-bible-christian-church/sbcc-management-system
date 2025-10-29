import { SecondaryButton } from '../../../components/ui/Button';
import { HiOutlineX } from 'react-icons/hi';

export const MemberFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-sbcc-primary"
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Ministry Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ministry
          </label>
          <select
            value={filters.ministry}
            onChange={(e) => onFilterChange('ministry', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-sbcc-primary"
          >
            <option value="">All Ministries</option>
            <option value="Music Ministry">Music Ministry</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Children Ministry">Children Ministry</option>
            <option value="Prayer Ministry">Prayer Ministry</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-sbcc-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <SecondaryButton
            onClick={onReset}
            icon={HiOutlineX}
            className="w-full"
          >
            Clear Filters
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default MemberFilters;
