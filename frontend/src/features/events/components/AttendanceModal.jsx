import { Spinner, Table } from 'flowbite-react';
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
        <Spinner size="xl" />
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

      <Table className="events-table">
        <Table.Head>
          <Table.HeadCell>Member</Table.HeadCell>
          <Table.HeadCell>Email</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Checked In</Table.HeadCell>
          <Table.HeadCell>
            <span className="sr-only">Actions</span>
          </Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {report.registrations.map((registration) => (
            <Table.Row key={registration.id} className="bg-white">
              <Table.Cell className="font-medium text-sbcc-dark">
                {registration.member_name}
              </Table.Cell>
              <Table.Cell>{registration.member_email}</Table.Cell>
              <Table.Cell>
                {registration.attended ? (
                  <span className="events-status-chip events-status-chip--success">Attended</span>
                ) : (
                  <span className="events-status-chip events-status-chip--warning">
                    Not marked
                  </span>
                )}
              </Table.Cell>
              <Table.Cell>
                {registration.check_in_time
                  ? formatDateTimeDisplay(registration.check_in_time)
                  : '—'}
              </Table.Cell>
              <Table.Cell className="text-right">
                {canManage && !registration.attended && (
                  <PrimaryButton
                    size="sm"
                    icon={HiClipboardCheck}
                    onClick={() => onMarkAttended(registration.id)}
                  >
                    Mark attended
                  </PrimaryButton>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default AttendanceModalContent;
