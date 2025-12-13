import {
  HiCalendar,
  HiLocationMarker,
  HiOutlinePencil,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiUserGroup,
} from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { STATUS_METADATA, EVENT_TYPE_METADATA } from '../utils/constants';
import {
  formatCapacity,
  formatDateRange,
  getEventTypeLabel,
  withAlpha,
} from '../utils/format';
import { format } from 'date-fns';

// Status-based colors (matching calendar)
const getStatusColor = (status) => {
  switch(status) {
    case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'published': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'completed': return 'bg-green-50 text-green-600 border-green-100';
    case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
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
      <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
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

        return (
          <article
            key={event.id ?? event.title}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all cursor-pointer"
            onClick={() => onViewDetails && onViewDetails(event)}
          >
            {/* Content */}
            <div className="p-4">
              {/* Status & Type Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded border ${getStatusColor(event.status)}`}>
                  {statusMeta.label}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-500 bg-gray-50 rounded">
                  {getEventTypeLabel(event.event_type)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-sbcc-orange transition-colors">
                {event.title}
              </h3>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center text-xs text-gray-500">
                  <HiCalendar className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-gray-400" />
                  <span>{format(startDate, 'MMM d, yyyy')} at {format(startDate, 'h:mm a')}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <HiLocationMarker className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{event.location || 'TBA'}</span>
                </div>
                {event.max_attendees && (
                  <div className="flex items-center text-xs text-gray-500">
                    <HiUserGroup className="flex-shrink-0 mr-2 h-3.5 w-3.5 text-gray-400" />
                    <span>{formatCapacity(event)}</span>
                  </div>
                )}
              </div>

              {/* Description Preview */}
              {event.description && (
                <p className="mt-3 text-xs text-gray-400 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>

            {/* Action Footer - Management Only */}
            {canManage && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                  className="p-1.5 text-gray-400 hover:text-sbcc-orange hover:bg-orange-50 rounded transition-colors"
                  title="Edit"
                >
                  <HiOutlinePencil className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="w-4 h-4" />
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
