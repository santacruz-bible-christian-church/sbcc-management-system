import {
  HiCalendar,
  HiLocationMarker,
  HiOutlinePencil,
  HiOutlinePlusCircle,
  HiOutlineTrash,
  HiUserGroup,
} from 'react-icons/hi';
import { Button, PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { EVENT_TYPE_METADATA, STATUS_METADATA } from '../utils/constants';
import {
  formatCapacity,
  formatDateRange,
  getEventTypeLabel,
  withAlpha,
} from '../utils/format';
import { SBCC_COLORS } from '../../../store/theme.store';

const statusStyle = (status) => {
  const meta = STATUS_METADATA[status] ?? STATUS_METADATA.draft;
  return {
    backgroundColor: withAlpha(meta.tint, 0.2),
    color: meta.text,
  };
};

const eventTypeStyle = (eventType) => {
  const meta = EVENT_TYPE_METADATA[eventType] ?? { tint: SBCC_COLORS.primary };
  return {
    backgroundColor: withAlpha(meta.tint, 0.18),
    color: meta.tint,
  };
};

export const EventsBoard = ({
  events,
  loading,
  canManage,
  onCreate,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return (
      <div className="events-empty-state">
        <h2>No events found</h2>
        <p>Try adjusting your filters or create a new event to get started.</p>
        {canManage && (
          <PrimaryButton icon={HiOutlinePlusCircle} onClick={onCreate}>
            Create first event
          </PrimaryButton>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => {
        return (
          <article key={event.id ?? event.title} className="events-card">
            <header className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="events-status-badge" style={statusStyle(event.status)}>
                  {STATUS_METADATA[event.status]?.label ?? STATUS_METADATA.draft.label}
                </span>
                <h3 className="events-card-title">{event.title}</h3>
                {event.description && (
                  <p className="events-card-description">{event.description}</p>
                )}
              </div>
              <span className="events-type-chip" style={eventTypeStyle(event.event_type)}>
                {getEventTypeLabel(event.event_type)}
              </span>
            </header>

            <dl className="events-meta-grid">
              <div>
                <dt className="flex items-center gap-2 uppercase text-[11px] tracking-[0.12em] text-sbcc-gray">
                  <HiCalendar className="h-4 w-4 text-sbcc-dark-orange" />
                  Schedule
                </dt>
                <dd>{formatDateRange(event.date, event.end_date)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 uppercase text-[11px] tracking-[0.12em] text-sbcc-gray">
                  <HiLocationMarker className="h-4 w-4 text-sbcc-dark-orange" />
                  Location
                </dt>
                <dd>{event.location || 'To be announced'}</dd>
              </div>
              {event.max_attendees && (
                <div>
                  <dt className="flex items-center gap-2 uppercase text-[11px] tracking-[0.12em] text-sbcc-gray">
                    <HiUserGroup className="h-4 w-4 text-sbcc-dark-orange" />
                    Capacity
                  </dt>
                  <dd>{event.max_attendees} attendees</dd>
                </div>
              )}
            </dl>

            {canManage && (
              <footer className="events-card-actions">
                <div className="events-card-actions__right">
                  <SecondaryButton
                    size="sm"
                    icon={HiOutlinePencil}
                    onClick={() => onEdit(event)}
                  >
                    Edit
                  </SecondaryButton>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={HiOutlineTrash}
                    onClick={() => onDelete(event)}
                  >
                    Delete
                  </Button>
                </div>
              </footer>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default EventsBoard;
