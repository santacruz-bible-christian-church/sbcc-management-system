import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiChevronRight,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineEye,
} from 'react-icons/hi';
import { useAbsentMembers } from '../hooks/useAbsentMembers';
import { format, formatDistanceToNow } from 'date-fns';

const SeverityBadge = ({ consecutiveAbsences }) => {
  if (consecutiveAbsences >= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <HiOutlineExclamation className="w-3 h-3" />
        Critical
      </span>
    );
  }
  if (consecutiveAbsences >= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
        Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
      Monitor
    </span>
  );
};

const MemberAlertItem = ({ member, onViewDetails }) => {
  const navigate = useNavigate();

  const lastAttendedText = member.last_attended
    ? formatDistanceToNow(new Date(member.last_attended), { addSuffix: true })
    : 'Never attended';

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50/50 transition-all border border-transparent hover:border-red-100 group">
      {/* Alert indicator */}
      <div className="flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${
          member.consecutive_absences >= 5 ? 'bg-red-500 animate-pulse' :
          member.consecutive_absences >= 3 ? 'bg-orange-500' : 'bg-yellow-500'
        }`} />
      </div>

      {/* Member info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {member.member_name}
          </p>
          <SeverityBadge consecutiveAbsences={member.consecutive_absences} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HiOutlineCalendar className="w-3 h-3" />
            {lastAttendedText}
          </span>
          <span>
            {member.consecutive_absences} consecutive absence{member.consecutive_absences !== 1 ? 's' : ''}
          </span>
          {member.ministry && (
            <span className="text-gray-400">• {member.ministry}</span>
          )}
        </div>

        {/* Absence rate bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                member.absence_rate >= 50 ? 'bg-red-500' :
                member.absence_rate >= 30 ? 'bg-orange-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(member.absence_rate, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">
            {member.absence_rate}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={() => window.location.href = `mailto:${member.email}`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#FDB54A] hover:bg-amber-50 transition-colors"
          title="Send email"
        >
          <HiOutlineMail className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/members')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#FDB54A] hover:bg-amber-50 transition-colors"
          title="View member"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const AbsentMemberAlerts = () => {
  const { absentMembers, loading, error, refresh, threshold, days } = useAbsentMembers(3, 30);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const displayMembers = showAll ? absentMembers : absentMembers.slice(0, 5);
  const criticalCount = absentMembers.filter(m => m.consecutive_absences >= 5).length;
  const warningCount = absentMembers.filter(m => m.consecutive_absences >= 3 && m.consecutive_absences < 5).length;

  if (loading) {
    return (
      <div className="lg:col-span-12">
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineExclamation className="w-5 h-5 text-red-500" />
              <p className="text-red-600">Failed to load absence alerts</p>
            </div>
            <button
              onClick={refresh}
              className="text-sm text-red-700 hover:underline flex items-center gap-1"
            >
              <HiOutlineRefresh className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineUserGroup className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Absent Member Alerts</h2>
          {absentMembers.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              {absentMembers.length} member{absentMembers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-sm text-gray-500 hover:text-[#FDB54A] flex items-center gap-1 transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Alert Summary Bar */}
        {absentMembers.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-5 py-3 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                <span className="font-medium text-gray-900">{absentMembers.length}</span> members need follow-up
              </span>
              {criticalCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {criticalCount} critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  {warningCount} warning
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Tracking {threshold}+ absences in last {days} days
            </p>
          </div>
        )}

        {/* Members List */}
        <div className="p-4">
          {absentMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">All members are active!</p>
              <p className="text-sm text-gray-400 mt-1">
                No members with {threshold}+ absences in the last {days} days
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayMembers.map((member) => (
                <MemberAlertItem
                  key={member.member_id}
                  member={member}
                />
              ))}
            </div>
          )}

          {/* Show more / less */}
          {absentMembers.length > 5 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center py-2 text-sm text-gray-500 hover:text-[#FDB54A] transition-colors flex items-center justify-center gap-1"
              >
                {showAll ? (
                  <>
                    <HiOutlineX className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <HiOutlineEye className="w-4 h-4" />
                    Show all {absentMembers.length} members
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Action */}
        {absentMembers.length > 0 && (
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => navigate('/attendance')}
              className="w-full text-center text-sm text-[#FDB54A] hover:text-[#e5a43b] font-medium flex items-center justify-center gap-1"
            >
              View Attendance Records
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsentMemberAlerts;
