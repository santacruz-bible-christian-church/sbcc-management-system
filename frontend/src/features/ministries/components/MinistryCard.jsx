import { HiOutlinePencil, HiOutlineTrash, HiOutlineUsers, HiOutlineClock } from 'react-icons/hi';

export const MinistryCard = ({ ministry, canManage, onEdit, onDelete, onViewDetails }) => {
  return (
    <div className="bg-white rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)] p-6 hover:shadow-[2px_2px_15px_rgba(0,0,0,0.25)] transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-[20px] font-bold text-[#383838] mb-2">{ministry.name}</h3>
          <p className="text-[14px] text-[#A0A0A0] line-clamp-2">
            {ministry.description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineUsers className="w-5 h-5 text-[#FDB54A]" />
          <span className="text-[14px] text-[#383838]">
            <span className="font-bold">{ministry.active_member_count || 0}</span>
            <span className="text-[#A0A0A0]"> / {ministry.member_count || 0} members</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineClock className="w-5 h-5 text-[#FDB54A]" />
          <span className="text-[14px] text-[#383838]">
            <span className="font-bold">{ministry.upcoming_shifts?.length || 0}</span>
            <span className="text-[#A0A0A0]"> upcoming shifts</span>
          </span>
        </div>
      </div>

      {/* Leader */}
      {ministry.leader && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[12px] text-[#A0A0A0] mb-1">Ministry Leader</p>
          <p className="text-[14px] font-semibold text-[#383838]">
            {ministry.leader.full_name || ministry.leader.username}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(ministry)}
          className="flex-1 bg-[#FDB54A] hover:bg-[#e5a43b] text-white text-[14px] font-medium py-2 px-4 rounded-lg transition-colors"
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
              <HiOutlinePencil className="w-5 h-5 text-[#FFB039]" />
            </button>
            <button
              onClick={() => onDelete(ministry)}
              title="Delete"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineTrash className="w-5 h-5 text-[#E55050]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MinistryCard;
