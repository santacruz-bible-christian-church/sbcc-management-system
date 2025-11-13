import { HiUsers } from 'react-icons/hi';
import { formatDateTimeDisplay } from '../utils/format';

export const RegistrationModal = ({
  loading,
  error,
  event,
  registrations,
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

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <HiUsers className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-3 text-sbcc-gray">No registrations yet for this event.</p>
      </div>
    );
  }

  const totalRegistered = registrations.length;
  const maxAttendees = event?.max_attendees;
  const availableSlots = maxAttendees ? Math.max(0, maxAttendees - totalRegistered) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="attendance-card">
          <p className="attendance-card__label">Registered</p>
          <p className="attendance-card__value text-sbcc-primary">{totalRegistered}</p>
        </div>
        {maxAttendees && (
          <>
            <div className="attendance-card">
              <p className="attendance-card__label">Capacity</p>
              <p className="attendance-card__value">{maxAttendees}</p>
            </div>
            <div className="attendance-card">
              <p className="attendance-card__label">Available</p>
              <p className="attendance-card__value text-emerald-600">{availableSlots}</p>
            </div>
          </>
        )}
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
                Registered At
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {registrations.map((registration) => (
              <tr key={registration.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {registration.member_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {registration.member_email || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {registration.registered_at
                    ? formatDateTimeDisplay(registration.registered_at)
                    : '—'}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                  {registration.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationModal;
