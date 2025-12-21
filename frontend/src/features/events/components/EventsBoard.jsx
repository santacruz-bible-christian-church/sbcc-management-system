import {
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiOutlinePencil,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiUserGroup,
} from 'react-icons/hi';
import { PrimaryButton } from '../../../components/ui/Button';
import { STATUS_METADATA, EVENT_TYPE_METADATA } from '../utils/constants';
import { formatCapacity, getEventTypeLabel } from '../utils/format';
import { format } from 'date-fns';

// Event type accent colors (left border)
const getTypeAccentColor = (eventType) => {
  switch (eventType) {
    case 'service': return 'border-l-amber-500 bg-amber-50/30';
    case 'bible_study': return 'border-l-blue-500 bg-blue-50/30';
    case 'prayer_meeting': return 'border-l-purple-500 bg-purple-50/30';
    case 'fellowship': return 'border-l-green-500 bg-green-50/30';
    case 'outreach': return 'border-l-orange-500 bg-orange-50/30';
    default: return 'border-l-gray-400 bg-gray-50/30';
  }
};

// Status badge styles
const getStatusStyle = (status) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-600';
    case 'published': return 'bg-emerald-100 text-emerald-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Date block component
const DateBlock = ({ date }) => {
  const d = new Date(date);
  return (
    <div className="flex-shrink-0 w-14 text-center">
      <div className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
        {format(d, 'MMM')}
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-none">
        {format(d, 'd')}
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">
        {format(d, 'EEE')}
      </div>
    </div>
  );
};

// Capacity progress bar
const CapacityBar = ({ current = 0, max }) => {
  if (!max) return null;
  const percentage = Math.min((current / max) * 100, 100);
  const isNearFull = percentage >= 80;
  const isFull = percentage >= 100;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-500 flex items-center gap-1">
          <HiUserGroup className="w-3.5 h-3.5" />
          Capacity
        </span>
        <span className={`font-medium ${isFull ? 'text-red-600' : isNearFull ? 'text-amber-600' : 'text-gray-700'}`}>
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isFull ? 'bg-red-500' : isNearFull ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const EventsBoard = ({
  events,
  loading,
  canManage,
  onCreate,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <HiCalendar className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No events found</h2>
        <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or create a new event.</p>
        {canManage && (
          <PrimaryButton icon={HiOutlinePlusCircle} onClick={onCreate}>
            Create Event
          </PrimaryButton>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => {
        const startDate = event.start_date ? new Date(event.start_date) : new Date(event.date);
        const statusMeta = STATUS_METADATA[event.status] ?? STATUS_METADATA.draft;
        const registrationCount = event.registration_count || event.registrations?.length || 0;

        return (
          <article
            key={event.id ?? event.title}
            className={`group relative bg-white rounded-xl border border-gray-100 border-l-4 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer ${getTypeAccentColor(event.event_type)}`}
            onClick={() => onViewDetails && onViewDetails(event)}
          >
            {/* Main Content */}
            <div className="p-4">
              {/* Header: Date Block + Title/Meta */}
              <div className="flex gap-4">
                {/* Date Block */}
                <DateBlock date={startDate} />

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  {/* Status & Type */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${getStatusStyle(event.status)}`}>
                      {statusMeta.label}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {getEventTypeLabel(event.event_type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FDB54A] transition-colors">
                    {event.title}
                  </h3>

                  {/* Meta info */}
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <HiClock className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                      <span>{format(startDate, 'h:mm a')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <HiLocationMarker className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              {event.description && (
                <p className="mt-3 text-xs text-gray-400 line-clamp-2 pl-[72px]">
                  {event.description}
                </p>
              )}

              {/* Capacity Progress Bar */}
              {event.max_attendees && (
                <div className="pl-[72px]">
                  <CapacityBar current={registrationCount} max={event.max_attendees} />
                </div>
              )}
            </div>

            {/* Hover Actions - Management Only */}
            {canManage && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-[#FDB54A] hover:bg-amber-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm border border-gray-100 transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default EventsBoard;
