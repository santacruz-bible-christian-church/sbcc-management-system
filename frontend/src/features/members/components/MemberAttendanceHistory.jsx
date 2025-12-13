import { useState } from 'react';
import {
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';
import { useMemberAttendance } from '../hooks/useMemberAttendance';

const getAttendanceColor = (rate) => {
  if (rate >= 80) return 'text-green-600 bg-green-100';
  if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const getAttendanceBarColor = (rate) => {
  if (rate >= 80) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getAttendanceTextColor = (rate) => {
  if (rate >= 80) return 'text-green-600';
  if (rate >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const MemberAttendanceHistory = ({ memberId }) => {
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

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <HiOutlineClipboardCheck className="w-5 h-5 text-[#FDB54A]" />
          Attendance History
        </h4>
        <span className="text-xs text-gray-500">Last {period_days} days</span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={HiOutlineChartBar}
          value={`${attendance_rate}%`}
          label="Attendance Rate"
          colorClass={getAttendanceColor(attendance_rate)}
        />
        <StatCard
          icon={HiOutlineCalendar}
          value={total_events}
          label="Total Events"
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={HiCheckCircle}
          value={attended}
          label="Present"
          colorClass="bg-green-100 text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          icon={HiXCircle}
          value={absent}
          label="Absent"
          colorClass="bg-red-100 text-red-600"
          valueColor="text-red-600"
        />
      </div>

      {/* Attendance Rate Bar */}
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
          <span className={`text-sm font-bold ${getAttendanceTextColor(attendance_rate)}`}>
            {attendance_rate}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getAttendanceBarColor(attendance_rate)}`}
            style={{ width: `${attendance_rate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>
            Last attended: {last_attended ? formatDistanceToNow(new Date(last_attended), { addSuffix: true }) : 'Never'}
          </span>
          {consecutive_absences > 0 && (
            <span className="text-red-500 font-medium">
              {consecutive_absences} consecutive absence{consecutive_absences !== 1 ? 's' : ''}
            </span>
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
              <AttendanceRecord key={index} record={record} />
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

// Sub-components
const StatCard = ({ icon: Icon, value, label, colorClass, valueColor = 'text-gray-900' }) => (
  <div className="p-3 bg-gray-50 rounded-xl text-center">
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${colorClass}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

const AttendanceRecord = ({ record }) => (
  <div className={`flex items-center justify-between px-4 py-3 ${record.attended ? 'bg-white' : 'bg-red-50/50'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${record.attended ? 'bg-green-100' : 'bg-red-100'}`}>
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
        record.attended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
);

export default MemberAttendanceHistory;
