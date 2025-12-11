import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiCheckCircle,
  HiXCircle,
  HiOutlineCake,
  HiOutlineHeart,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { useMemberAttendance } from '../hooks/useMemberAttendance';

// Attendance History Section Component
const AttendanceHistorySection = ({ memberId }) => {
  const { attendanceData, loading, error, refresh } = useMemberAttendance(memberId, true);
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineClipboardCheck className="w-5 h-5 text-[#FDB54A]" />
          Attendance History
        </h4>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineClipboardCheck className="w-5 h-5 text-[#FDB54A]" />
          Attendance History
        </h4>
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={refresh}
            className="text-xs text-red-700 hover:underline flex items-center gap-1 mx-auto"
          >
            <HiOutlineRefresh className="w-3 h-3" /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!attendanceData) return null;

  const {
    attendance_rate = 0,
    total_events = 0,
    attended = 0,
    absent = 0,
    consecutive_absences = 0,
    last_attended,
    recent_history = [],
    period_days = 90,
  } = attendanceData;

  const displayHistory = showAll ? recent_history : recent_history.slice(0, 5);

  // Determine attendance status color
  const getAttendanceColor = (rate) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <HiOutlineClipboardCheck className="w-5 h-5 text-[#FDB54A]" />
          Attendance History
        </h4>
        <span className="text-xs text-gray-500">Last {period_days} days</span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getAttendanceColor(attendance_rate)}`}>
            <HiOutlineChartBar className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-gray-900">{attendance_rate}%</p>
          <p className="text-xs text-gray-500">Attendance Rate</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 mb-2">
            <HiOutlineCalendar className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-gray-900">{total_events}</p>
          <p className="text-xs text-gray-500">Total Events</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-2">
            <HiCheckCircle className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-green-600">{attended}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 mb-2">
            <HiXCircle className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-red-600">{absent}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
      </div>

      {/* Attendance Rate Bar */}
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
          <span className={`text-sm font-bold ${
            attendance_rate >= 80 ? 'text-green-600' :
            attendance_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {attendance_rate}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              attendance_rate >= 80 ? 'bg-green-500' :
              attendance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${attendance_rate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Last attended: {last_attended ? formatDistanceToNow(new Date(last_attended), { addSuffix: true }) : 'Never'}</span>
          {consecutive_absences > 0 && (
            <span className="text-red-500 font-medium">{consecutive_absences} consecutive absence{consecutive_absences !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Recent Attendance List */}
      {recent_history.length > 0 ? (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">Recent Attendance</p>
          </div>
          <div className="divide-y divide-gray-100">
            {displayHistory.map((record, index) => (
              <div
                key={index}
                className={`flex items-center justify-between px-4 py-3 ${
                  record.attended ? 'bg-white' : 'bg-red-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    record.attended ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.attended ? (
                      <HiCheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <HiXCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.event}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(record.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    record.attended
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {record.attended ? 'Present' : 'Absent'}
                  </span>
                  {record.check_in_time && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(record.check_in_time), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recent_history.length > 5 && (
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm text-[#FDB54A] hover:text-[#e5a43b] font-medium"
              >
                {showAll ? 'Show less' : `Show all ${recent_history.length} records`}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-xl">
          <HiOutlineClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No attendance records in the last {period_days} days</p>
        </div>
      )}
    </div>
  );
};

// Upcoming Celebrations Helper
const UpcomingCelebration = ({ date, type, label }) => {
  if (!date) return null;

  const today = new Date();
  const celebrationDate = new Date(date);

  // Set celebration to this year
  celebrationDate.setFullYear(today.getFullYear());

  // If the date has passed this year, set to next year
  if (celebrationDate < today) {
    celebrationDate.setFullYear(today.getFullYear() + 1);
  }

  const daysUntil = differenceInDays(celebrationDate, today);

  // Only show if within 30 days
  if (daysUntil > 30) return null;

  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 7;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      isToday ? 'bg-amber-100 border border-amber-200' :
      isSoon ? 'bg-amber-50' : 'bg-gray-50'
    }`}>
      <div className={`p-2 rounded-lg ${
        type === 'birthday' ? 'bg-pink-100' : 'bg-purple-100'
      }`}>
        {type === 'birthday' ? (
          <HiOutlineCake className="w-5 h-5 text-pink-600" />
        ) : (
          <HiOutlineHeart className="w-5 h-5 text-purple-600" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {format(celebrationDate, 'MMMM d')}
        </p>
      </div>
      <div className={`text-right ${isToday ? 'text-amber-700' : isSoon ? 'text-amber-600' : 'text-gray-500'}`}>
        <p className="text-sm font-bold">
          {isToday ? '🎉 Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
};

export const MemberDetailsModal = ({ open, onClose, member }) => {
  if (!open || !member) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member.date_of_birth);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {member.full_name || `${member.first_name} ${member.last_name}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Member Profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Badge */}
            {member.status && (
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  member.status === 'active' ? 'bg-green-100 text-green-700' :
                  member.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
            )}

            {/* Upcoming Celebrations */}
            {(member.date_of_birth || member.membership_date) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Celebrations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UpcomingCelebration
                    date={member.date_of_birth}
                    type="birthday"
                    label="Birthday"
                  />
                  <UpcomingCelebration
                    date={member.membership_date}
                    type="anniversary"
                    label="Membership Anniversary"
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                    <HiOutlineMail className="w-5 h-5 text-[#FDB54A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{member.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                    <HiOutlinePhone className="w-5 h-5 text-[#FDB54A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{member.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {member.address && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{member.address}</p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HiOutlineUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {member.gender || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(member.date_of_birth)}
                      {age && ` (${age} years old)`}
                    </p>
                  </div>
                </div>

                {member.baptism_date && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <HiOutlineCalendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Baptism Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(member.baptism_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ministry Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ministry Information</h4>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-[#FDB54A]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Ministry</p>
                  <p className="text-sm font-medium text-gray-900">
                    {member.ministry_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Membership Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(member.membership_date)}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    #{member.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance History Section */}
            <AttendanceHistorySection memberId={member.id} />

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(member.created_at)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(member.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

MemberDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  member: PropTypes.object,
};

export default MemberDetailsModal;
