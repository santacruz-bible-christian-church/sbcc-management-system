import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Spinner, Table } from 'flowbite-react';
import {
  HiCalendar,
  HiOutlineClock,
  HiOutlinePlusCircle,
  HiOutlineRefresh,
  HiOutlinePencil,
  HiOutlineTrash,
  HiLocationMarker,
  HiUserGroup,
  HiClipboardCheck,
  HiOutlineUserAdd,
  HiOutlineUserRemove,
  HiOutlineFilter,
  HiX,
} from 'react-icons/hi';
import { clsx } from 'clsx';
import { eventsApi } from '../../../api/events.api';
import { useAuth } from '../../auth/hooks/useAuth';
import { Card, StatsCard } from '../../../components/ui/Card';
import { Button, PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import '../styles/events.css';

const MANAGER_ROLES = ['admin', 'pastor', 'staff'];

const EVENT_TYPE_OPTIONS = [
  { value: 'service', label: 'Sunday Service' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'prayer_meeting', label: 'Prayer Meeting' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DEFAULT_FILTERS = {
  event_type: '',
  status: '',
  ministry: '',
  start_date: '',
  end_date: '',
};

const DEFAULT_FORM_VALUES = {
  title: '',
  description: '',
  event_type: 'service',
  status: 'draft',
  date: '',
  end_date: '',
  location: '',
  ministry: '',
  max_attendees: '',
  is_recurring: false,
};

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_BADGE_CLASS = {
  draft: 'events-status-badge--draft',
  published: 'events-status-badge--published',
  completed: 'events-status-badge--completed',
  cancelled: 'events-status-badge--cancelled',
};

const EVENT_TYPE_CLASS = {
  service: 'events-type-chip--service',
  bible_study: 'events-type-chip--bible',
  prayer_meeting: 'events-type-chip--prayer',
  fellowship: 'events-type-chip--fellowship',
  outreach: 'events-type-chip--outreach',
  other: 'events-type-chip--other',
};

const formatDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

const formatDateTimeDisplay = (value) => {
  if (!value) return 'TBA';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBA';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const formatRangeDisplay = (start, end) => {
  const startLabel = formatDateTimeDisplay(start);
  if (!end) return startLabel;
  const endLabel = formatDateTimeDisplay(end);
  return `${startLabel} - ${endLabel}`;
};

const serializeFormValues = (values) => {
  const payload = {
    title: values.title,
    description: values.description,
    event_type: values.event_type,
    status: values.status,
    location: values.location,
    is_recurring: Boolean(values.is_recurring),
  };

  if (values.date) {
    payload.date = new Date(values.date).toISOString();
  }

  if (values.end_date) {
    payload.end_date = new Date(values.end_date).toISOString();
  } else {
    payload.end_date = null;
  }

  if (values.ministry) {
    payload.ministry = Number(values.ministry);
  } else {
    payload.ministry = null;
  }

  if (values.max_attendees !== '' && values.max_attendees !== null && values.max_attendees !== undefined) {
    payload.max_attendees = Number(values.max_attendees);
  } else {
    payload.max_attendees = null;
  }

  return payload;
};

const MODAL_SIZE_CLASSES = {
  md: 'events-modal__dialog--md',
  lg: 'events-modal__dialog--lg',
  xl: 'events-modal__dialog--xl',
  '2xl': 'events-modal__dialog--2xl',
  '5xl': 'events-modal__dialog--5xl',
};

const EventModal = ({ open, title, onClose, size = 'md', children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="events-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={clsx('events-modal__dialog', MODAL_SIZE_CLASSES[size] ?? MODAL_SIZE_CLASSES.md)}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="events-modal__header">
          <h2 className="events-modal__title">{title}</h2>
          <button
            type="button"
            className="events-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <HiX className="h-5 w-5" />
          </button>
        </header>
        <div className="events-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const EventsPage = () => {
  const { user } = useAuth();
  const canManageEvents = MANAGER_ROLES.includes(user?.role);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [ordering, setOrdering] = useState('-date');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [activeEventId, setActiveEventId] = useState(null);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [attendanceError, setAttendanceError] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.listEvents({
        filters,
        search: appliedSearch,
        ordering,
        page: 1,
        pageSize: 100,
      });

      const results = Array.isArray(data) ? data : data.results ?? [];
      setEvents(results);
    } catch (err) {
      setEvents([]);
      setError(err.response?.data?.detail || 'Unable to load events right now.');
    } finally {
      setLoading(false);
    }
  }, [filters, appliedSearch, ordering]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const summary = useMemo(() => {
    return events.reduce(
      (acc, event) => {
        acc.total += 1;
        if (event.status && acc.byStatus[event.status] !== undefined) {
          acc.byStatus[event.status] += 1;
        }
        acc.registered += event.attendee_count ?? 0;
        acc.attended += event.attended_count ?? 0;
        return acc;
      },
      {
        total: 0,
        registered: 0,
        attended: 0,
        byStatus: {
          draft: 0,
          published: 0,
          completed: 0,
          cancelled: 0,
        },
      }
    );
  }, [events]);

  const completionRate = useMemo(() => {
    const base = summary.byStatus.draft + summary.byStatus.published + summary.byStatus.completed;
    if (base === 0) return 0;
    return Math.round((summary.byStatus.completed / base) * 100);
  }, [summary]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm('');
    setAppliedSearch('');
    setOrdering('-date');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setAppliedSearch(searchTerm.trim());
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormValues(DEFAULT_FORM_VALUES);
    setActiveEventId(null);
    setFormOpen(true);
  };

  const openEditModal = (eventItem) => {
    setFormMode('edit');
    setActiveEventId(eventItem.id);
    setFormValues({
      title: eventItem.title ?? '',
      description: eventItem.description ?? '',
      event_type: eventItem.event_type ?? 'service',
      status: eventItem.status ?? 'draft',
      date: formatDateTimeInput(eventItem.date),
      end_date: formatDateTimeInput(eventItem.end_date),
      location: eventItem.location ?? '',
      ministry: eventItem.ministry ?? '',
      max_attendees: eventItem.max_attendees ?? '',
      is_recurring: Boolean(eventItem.is_recurring),
    });
    setFormOpen(true);
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = serializeFormValues(formValues);
      if (formMode === 'create') {
        await eventsApi.createEvent(payload);
      } else if (activeEventId) {
        await eventsApi.updateEvent(activeEventId, payload);
      }
      setFormOpen(false);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventItem) => {
    const confirmed = window.confirm(`Delete "${eventItem.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await eventsApi.deleteEvent(eventItem.id);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (eventItem) => {
    setSubmitting(true);
    try {
      await eventsApi.registerForEvent(eventItem.id);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Unable to register for event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async (eventItem) => {
    setSubmitting(true);
    try {
      await eventsApi.unregisterFromEvent(eventItem.id);
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Unable to unregister from event.');
    } finally {
      setSubmitting(false);
    }
  };

  const openAttendanceModal = async (eventItem) => {
    setAttendanceOpen(true);
    setAttendanceLoading(true);
    setAttendanceError(null);
    setActiveEventId(eventItem.id);
    try {
      const report = await eventsApi.getAttendanceReport(eventItem.id);
      setAttendanceReport(report);
    } catch (err) {
      setAttendanceReport(null);
      setAttendanceError(err.response?.data?.detail || 'Unable to load attendance report at the moment.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAttended = async (registrationId) => {
    if (!activeEventId) return;
    try {
      await eventsApi.markRegistrationAttended(registrationId);
      const report = await eventsApi.getAttendanceReport(activeEventId);
      setAttendanceReport(report);
      await loadEvents();
    } catch (err) {
      setAttendanceError(err.response?.data?.detail || 'Unable to mark attendance.');
    }
  };

  return (
    <div className="events-shell">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="events-header-card">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-sbcc-dark">Events &amp; Attendance</h1>
            <p className="mt-2 text-sbcc-gray max-w-2xl">
              Coordinate ministry gatherings, track attendance, and keep your church community informed.
            </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton
            icon={HiOutlineFilter}
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={clsx(
              'bg-white text-sbcc-dark',
              filtersOpen && 'bg-sbcc-light-orange/60'
            )}
          >
            {filtersOpen ? 'Hide Filters' : 'Filter'}
          </SecondaryButton>
          <SecondaryButton
            icon={HiOutlineRefresh}
            onClick={loadEvents}
            loading={loading}
            className="bg-white text-sbcc-dark"
          >
            Refresh
          </SecondaryButton>
          {canManageEvents && (
            <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreateModal}>
              New Event
            </PrimaryButton>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={summary.total}
          change={`${summary.byStatus.published} published`}
          icon={HiCalendar}
            variant="orange"
          />
        <StatsCard
          title="In Draft"
          value={summary.byStatus.draft}
          change="Awaiting publication"
          icon={HiOutlineClock}
          variant="blue"
        />
        <StatsCard
          title="Completed"
          value={summary.byStatus.completed}
          change={`${completionRate}% completion`}
          icon={HiClipboardCheck}
          variant="green"
        />
        <StatsCard
          title="Attendance"
          value={`${summary.attended}/${summary.registered}`}
          change="Attended / Registered"
          icon={HiUserGroup}
          variant="purple"
        />
      </section>

      {filtersOpen && (
        <Card
          title="Filters"
          subtitle="Narrow down events by ministry, status, or schedule"
          className="space-y-4"
        >
          <form onSubmit={handleSearchSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="events-field-label" htmlFor="events-search">
                  Search
                </label>
                <input
                  id="events-search"
                  type="search"
                  className="events-input"
                  placeholder="Title, description, or location"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="events-type-filter">
                  Event Type
                </label>
                <select
                  id="events-type-filter"
                  name="event_type"
                  className="events-input"
                  value={filters.event_type}
                  onChange={handleFilterChange}
                >
                  <option value="">All types</option>
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="events-field-label" htmlFor="events-status-filter">
                  Status
                </label>
                <select
                  id="events-status-filter"
                  name="status"
                  className="events-input"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="events-field-label" htmlFor="events-ordering-filter">
                  Order By
                </label>
                <select
                  id="events-ordering-filter"
                  className="events-input"
                  value={ordering}
                  onChange={(event) => setOrdering(event.target.value)}
                >
                  <option value="-date">Newest date</option>
                  <option value="date">Oldest date</option>
                  <option value="-created_at">Recently created</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="events-field-label" htmlFor="events-ministry-filter">
                  Ministry ID
                </label>
                <input
                  id="events-ministry-filter"
                  name="ministry"
                  type="number"
                  className="events-input"
                  placeholder="e.g. 4"
                  value={filters.ministry}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="events-field-label" htmlFor="events-start-filter">
                  Start Date
                </label>
                <input
                  id="events-start-filter"
                  name="start_date"
                  type="date"
                  className="events-input"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="events-field-label" htmlFor="events-end-filter">
                  End Date
                </label>
                <input
                  id="events-end-filter"
                  name="end_date"
                  type="date"
                  className="events-input"
                  value={filters.end_date}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="flex items-end gap-3">
                <PrimaryButton type="submit" className="flex-1">
                  Apply
                </PrimaryButton>
                <SecondaryButton type="button" onClick={handleResetFilters} className="flex-1">
                  Reset
                </SecondaryButton>
              </div>
            </div>
          </form>
        </Card>
      )}

        {error && (
          <div className="events-banner events-banner--error">
            <p>{error}</p>
          </div>
        )}

        <section className="events-board">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" />
              <p className="mt-3 text-sbcc-gray">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="events-empty-state">
              <h2>No events found</h2>
              <p>Try adjusting your filters or create a new event to get started.</p>
              {canManageEvents && (
                <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreateModal}>
                  Create first event
                </PrimaryButton>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((eventItem) => (
                <article key={eventItem.id ?? eventItem.title} className="events-card">
                  <header className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span
                        className={clsx(
                          'events-status-badge',
                          STATUS_BADGE_CLASS[eventItem.status] ?? STATUS_BADGE_CLASS.draft
                        )}
                      >
                        {STATUS_LABELS[eventItem.status] ?? 'Draft'}
                      </span>
                      <h3 className="events-card-title">{eventItem.title}</h3>
                      {eventItem.description && (
                        <p className="events-card-description">{eventItem.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span
                        className={clsx(
                          'events-type-chip',
                          EVENT_TYPE_CLASS[eventItem.event_type] ?? EVENT_TYPE_CLASS.other
                        )}
                      >
                        {EVENT_TYPE_OPTIONS.find((option) => option.value === eventItem.event_type)?.label ||
                          eventItem.event_type}
                      </span>
                      {eventItem.ministry_name && (
                        <span className="events-type-chip events-type-chip--ministry">
                          {eventItem.ministry_name}
                        </span>
                      )}
                    </div>
                  </header>

                  <dl className="events-meta-grid">
                    <div>
                      <dt>
                        <HiCalendar className="h-4 w-4 text-sbcc-orange" />
                        Schedule
                      </dt>
                      <dd>{formatRangeDisplay(eventItem.date, eventItem.end_date)}</dd>
                    </div>
                    <div>
                      <dt>
                        <HiLocationMarker className="h-4 w-4 text-sbcc-orange" />
                        Location
                      </dt>
                      <dd>{eventItem.location || 'To be announced'}</dd>
                    </div>
                    <div>
                      <dt>
                        <HiUserGroup className="h-4 w-4 text-sbcc-orange" />
                        Attendance
                      </dt>
                      <dd>
                        {eventItem.max_attendees
                          ? `${eventItem.attendee_count ?? 0}/${eventItem.max_attendees} registered`
                          : `${eventItem.attendee_count ?? 0} registered`}
                      </dd>
                    </div>
                  </dl>

                  <footer className="events-card-actions">
                    <div className="events-card-actions__left">
                      {eventItem.is_registered ? (
                        <Button
                          variant="secondary"
                          icon={HiOutlineUserRemove}
                          onClick={() => handleUnregister(eventItem)}
                          disabled={submitting}
                        >
                          Unregister
                        </Button>
                      ) : (
                        <PrimaryButton
                          icon={HiOutlineUserAdd}
                          onClick={() => handleRegister(eventItem)}
                          disabled={eventItem.is_full || submitting}
                        >
                          {eventItem.is_full ? 'Event Full' : 'Register'}
                        </PrimaryButton>
                      )}
                    </div>

                    {canManageEvents && (
                      <div className="events-card-actions__right">
                        <SecondaryButton
                          icon={HiOutlinePencil}
                          size="sm"
                          onClick={() => openEditModal(eventItem)}
                          disabled={submitting}
                        >
                          Edit
                        </SecondaryButton>
                        <Button
                          variant="danger"
                          icon={HiOutlineTrash}
                          size="sm"
                          onClick={() => handleDeleteEvent(eventItem)}
                          disabled={submitting}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="info"
                          icon={HiClipboardCheck}
                          size="sm"
                          onClick={() => openAttendanceModal(eventItem)}
                          disabled={submitting}
                        >
                          Attendance
                        </Button>
                      </div>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <EventModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="xl"
        title={formMode === 'create' ? 'Create Event' : 'Update Event'}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="events-field-label" htmlFor="event-title">
                  Title
                </label>
                <input
                  id="event-title"
                  name="title"
                  className="events-input"
                  value={formValues.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-type">
                  Event Type
                </label>
                <select
                  id="event-type"
                  name="event_type"
                  className="events-input"
                  value={formValues.event_type}
                  onChange={handleFormChange}
                  required
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-status">
                  Status
                </label>
                <select
                  id="event-status"
                  name="status"
                  className="events-input"
                  value={formValues.status}
                  onChange={handleFormChange}
                  required
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-date">
                  Start Date &amp; Time
                </label>
                <input
                  id="event-date"
                  name="date"
                  type="datetime-local"
                  className="events-input"
                  value={formValues.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-end">
                  End Date &amp; Time
                </label>
                <input
                  id="event-end"
                  name="end_date"
                  type="datetime-local"
                  className="events-input"
                  value={formValues.end_date}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-location">
                  Location
                </label>
                <input
                  id="event-location"
                  name="location"
                  className="events-input"
                  value={formValues.location}
                  onChange={handleFormChange}
                  placeholder="e.g. Main Sanctuary"
                  required
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-ministry">
                  Ministry ID
                </label>
                <input
                  id="event-ministry"
                  name="ministry"
                  className="events-input"
                  value={formValues.ministry}
                  onChange={handleFormChange}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="events-field-label" htmlFor="event-capacity">
                  Capacity
                </label>
                <input
                  id="event-capacity"
                  name="max_attendees"
                  type="number"
                  className="events-input"
                  value={formValues.max_attendees}
                  onChange={handleFormChange}
                  placeholder="Leave blank for unlimited"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="events-field-label" htmlFor="event-description">
                  Description
                </label>
                <textarea
                  id="event-description"
                  name="description"
                  className="events-input h-28"
                  value={formValues.description}
                  onChange={handleFormChange}
                  placeholder="Share details, agenda, or speaker information"
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  id="event-recurring"
                  name="is_recurring"
                  type="checkbox"
                  className="h-4 w-4 text-sbcc-primary focus:ring-sbcc-primary"
                  checked={formValues.is_recurring}
                  onChange={handleFormChange}
                />
                <label htmlFor="event-recurring" className="text-sm text-sbcc-dark">
                  This is a recurring event
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <SecondaryButton type="button" onClick={() => setFormOpen(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={submitting}>
                {formMode === 'create' ? 'Create Event' : 'Save Changes'}
              </PrimaryButton>
            </div>
        </form>
      </EventModal>

      <EventModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        size="5xl"
        title="Attendance Overview"
      >
        {attendanceLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="xl" />
          </div>
        ) : attendanceError ? (
          <div className="events-banner events-banner--error">{attendanceError}</div>
        ) : attendanceReport ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="attendance-card">
                  <p className="attendance-card__label">Registered</p>
                  <p className="attendance-card__value">{attendanceReport.total_registered}</p>
                </div>
                <div className="attendance-card">
                  <p className="attendance-card__label">Attended</p>
                  <p className="attendance-card__value text-emerald-600">
                    {attendanceReport.total_attended}
                  </p>
                </div>
                <div className="attendance-card">
                  <p className="attendance-card__label">Absent</p>
                  <p className="attendance-card__value text-rose-500">
                    {attendanceReport.total_absent}
                  </p>
                </div>
                <div className="attendance-card">
                  <p className="attendance-card__label">Attendance Rate</p>
                  <p className="attendance-card__value text-sbcc-primary">
                    {attendanceReport.attendance_rate}%
                  </p>
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
                  {attendanceReport.registrations.map((registration) => (
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
                        {canManageEvents && !registration.attended && (
                          <PrimaryButton
                            size="sm"
                            icon={HiClipboardCheck}
                            onClick={() => handleMarkAttended(registration.id)}
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
          ) : (
            <p className="text-center text-sbcc-gray">No attendance data available.</p>
          )}
      </EventModal>
    </div>
  );
};

export default EventsPage;
