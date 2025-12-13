import { Badge } from 'flowbite-react';
import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiUserGroup,
  HiOutlinePencil,
} from 'react-icons/hi';
import { format } from 'date-fns';
import { SecondaryButton } from '../../../components/ui/Button';
import { EventModal } from './EventModal';
import { EVENT_TYPE_METADATA, STATUS_METADATA } from '../utils/constants';
import {
  formatCapacity,
  getEventTypeLabel,
  withAlpha,
} from '../utils/format';
import { SBCC_COLORS } from '../../../store/theme.store';

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="p-2 bg-gray-50 rounded-lg text-sbcc-orange">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-800 truncate">{value}</dd>
    </div>
  </div>
);

export const EventDetailsModal = ({
  event,
  open,
  onClose,
  canManage,
  onEdit,
}) => {
  if (!event) return null;

  const eventTypeMeta = EVENT_TYPE_METADATA[event.event_type] ?? { tint: SBCC_COLORS.primary };
  const statusMeta = STATUS_METADATA[event.status] ?? STATUS_METADATA.draft;

  // Format dates for display
  const startDate = event.start_date ? new Date(event.start_date) : new Date(event.date);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(startDate, 'h:mm a');
  const endTime = event.end_date ? format(new Date(event.end_date), 'h:mm a') : null;

  return (
    <EventModal
      open={open}
      title="Event Details"
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold rounded-full border"
              style={{
                color: eventTypeMeta.tint,
                backgroundColor: withAlpha(eventTypeMeta.tint, 0.1),
                borderColor: withAlpha(eventTypeMeta.tint, 0.2),
              }}
            >
              {getEventTypeLabel(event.event_type)}
            </span>
            <span
              className="px-2.5 py-1 text-[10px] uppercase tracking-wide font-bold rounded-full border"
              style={{
                color: statusMeta.text,
                backgroundColor: withAlpha(statusMeta.tint, 0.1),
                borderColor: withAlpha(statusMeta.tint, 0.2),
              }}
            >
              {statusMeta.label}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {event.title}
          </h1>
        </div>

        {/* Details List */}
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <DetailItem
            icon={HiCalendar}
            label="Date"
            value={formattedDate}
          />
          <DetailItem
            icon={HiClock}
            label="Time"
            value={endTime ? `${formattedTime} - ${endTime}` : formattedTime}
          />
          <DetailItem
            icon={HiLocationMarker}
            label="Location"
            value={event.location || 'To be announced'}
          />
          {event.max_attendees && (
            <DetailItem
              icon={HiUserGroup}
              label="Capacity"
              value={formatCapacity(event)}
            />
          )}
        </div>

        {/* Description Section */}
        {event.description && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2">About this Event</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        {/* Footer Actions - Management only */}
        {canManage && (
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <SecondaryButton
              icon={HiOutlinePencil}
              onClick={() => onEdit(event)}
            >
              Edit Event
            </SecondaryButton>
          </div>
        )}
      </div>
    </EventModal>
  );
};

export default EventDetailsModal;
