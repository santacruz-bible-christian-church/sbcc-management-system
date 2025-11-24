import { formatDistanceToNow } from 'date-fns';
import { HiCheckCircle } from 'react-icons/hi';

export const MinistryOverviewTab = ({ ministry }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 py-4">
      {/* Leader Information */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[18px] font-bold text-[#383838]">Ministry Leader</h3>
          {ministry.leader && (
            <div className="flex items-center gap-1 text-green-600">
              <HiCheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Assigned</span>
            </div>
          )}
        </div>
        {ministry.leader ? (
          <div className="bg-gradient-to-br from-sbcc-light-orange to-white border border-sbcc-orange rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-sbcc-primary flex items-center justify-center text-white font-bold text-lg">
                {ministry.leader.full_name?.charAt(0).toUpperCase() || 'L'}
              </div>
              <div>
                <p className="text-[16px] font-semibold text-[#383838]">
                  {ministry.leader.full_name || ministry.leader.username}
                </p>
                <p className="text-[14px] text-[#A0A0A0]">
                  {ministry.leader.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <p className="text-[14px] text-[#A0A0A0] text-center">
              No leader assigned yet. Assign a member with "Lead" role in the Members tab.
            </p>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-[18px] font-bold text-[#383838] mb-3">Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[14px] text-[#A0A0A0]">Created</span>
            <span className="text-[14px] font-medium text-[#383838]">
              {formatDate(ministry.created_at)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[14px] text-[#A0A0A0]">Last Updated</span>
            <span className="text-[14px] font-medium text-[#383838]">
              {formatDistanceToNow(new Date(ministry.updated_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-[14px] text-[#A0A0A0]">Total Members</span>
            <span className="text-[14px] font-medium text-[#383838]">
              {ministry.member_count || 0}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[14px] text-[#A0A0A0]">Active Members</span>
            <span className="text-[14px] font-medium text-[#383838]">
              {ministry.active_member_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Shifts */}
      {ministry.upcoming_shifts && ministry.upcoming_shifts.length > 0 && (
        <div>
          <h3 className="text-[18px] font-bold text-[#383838] mb-3">
            Upcoming Unassigned Shifts
          </h3>
          <div className="space-y-2">
            {ministry.upcoming_shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#383838]">
                    {shift.role}
                  </p>
                  <p className="text-[12px] text-[#A0A0A0]">
                    {formatDate(shift.date)}
                    {shift.start_time && ` • ${shift.start_time.slice(0, 5)}`}
                  </p>
                </div>
                <span className="text-[12px] bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  Unassigned
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinistryOverviewTab;
