import { HiUserGroup } from 'react-icons/hi';
import { VisitorCard } from './VisitorCard';

export function VisitorsList({
  visitors,
  loading,
  onEdit,
  onDelete,
  onCheckIn,
  onConvert,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!visitors || visitors.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <HiUserGroup className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Visitors Found</h3>
        <p className="text-gray-500">
          Add your first visitor or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visitors.map((visitor) => (
        <VisitorCard
          key={visitor.id}
          visitor={visitor}
          onEdit={onEdit}
          onDelete={onDelete}
          onCheckIn={onCheckIn}
          onConvert={onConvert}
        />
      ))}
    </div>
  );
}

export default VisitorsList;
