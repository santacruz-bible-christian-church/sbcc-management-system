import { HiOutlinePencil, HiOutlineTrash, HiOutlineUsers, HiOutlineClock } from 'react-icons/hi';
import { generateColorFromId } from '../../../utils/colorUtils';

export const MinistryCard = ({ ministry, canManage, onEdit, onDelete, onViewDetails }) => {
  const accentColor = generateColorFromId(ministry.id);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{ministry.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {ministry.description || 'No description provided'}
            </p>
          </div>
          {/* Color dot indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineUsers className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold">{ministry.active_member_count || 0}</span>
              <span className="text-gray-500"> / {ministry.member_count || 0}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold">{ministry.upcoming_shifts?.length || 0}</span>
              <span className="text-gray-500"> shifts</span>
            </span>
          </div>
        </div>

        {/* Leader */}
        {ministry.leader && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Ministry Leader</p>
            <p className="text-sm font-medium text-gray-800">
              {ministry.leader.full_name || ministry.leader.username}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(ministry)}
            className="flex-1 bg-[#FDB54A] hover:bg-[#e5a43b] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Details
          </button>
          {canManage && (
            <>
              <button
                onClick={() => onEdit(ministry)}
                title="Edit"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlinePencil className="w-5 h-5 text-[#FDB54A]" />
              </button>
              <button
                onClick={() => onDelete(ministry)}
                title="Delete"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineTrash className="w-5 h-5 text-red-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinistryCard;
