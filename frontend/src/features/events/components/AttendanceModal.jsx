import { HiClipboardCheck } from 'react-icons/hi';
import { PrimaryButton } from '../../../components/ui/Button';
import { formatDateTimeDisplay } from '../utils/format';

export const AttendanceModalContent = ({
  loading,
  error,
  report,
  canManage,
  onMarkAttended,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sbcc-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="events-banner events-banner--error">{error}</div>;
  }

  if (!report) {
    return <p className="text-center text-sbcc-gray">No attendance data available.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="attendance-card">
          <p className="attendance-card__label">Registered</p>
          <p className="attendance-card__value">{report.total_registered}</p>
        </div>
        <div className="attendance-card">
          <p className="attendance-card__label">Attended</p>
          <p className="attendance-card__value text-emerald-600">{report.total_attended}</p>
        </div>
        <div className="attendance-card">
          <p className="attendance-card__label">Absent</p>
          <p className="attendance-card__value text-rose-500">{report.total_absent}</p>
        </div>
        <div className="attendance-card">
          <p className="attendance-card__label">Attendance Rate</p>
          <p className="attendance-card__value text-sbcc-primary">{report.attendance_rate}%</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-orange-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Checked In
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {report.registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {registration.member_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {registration.member_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {registration.attended ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      Attended
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                      Not marked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {registration.check_in_time
                    ? formatDateTimeDisplay(registration.check_in_time)
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {canManage && !registration.attended && (
                    <PrimaryButton
                      size="sm"
                      icon={HiClipboardCheck}
                      onClick={() => onMarkAttended(registration.id)}
                    >
                      Mark attended
                    </PrimaryButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceModalContent;
