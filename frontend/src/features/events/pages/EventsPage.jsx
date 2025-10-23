import { useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlinePlusCircle, HiOutlineRefresh } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import {
  AttendanceModalContent,
  EventModal,
  EventsBoard,
  EventsCalendar,
  EventsFilters,
  EventsForm,
  EventsSummaryCards,
} from '../components';
import { MANAGER_ROLES } from '../utils/constants';
import { prepareEventFormValues } from '../utils/format';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import '../../../styles/events.css';
import '../../../styles/calendar.css';

export const EventsPage = () => {
  const { user } = useAuth();
  const canManageEvents = MANAGER_ROLES.includes(user?.role);
  const {
    events,
    loading,
    error,
    filters,
    search,
    ordering,
    summary,
    completionRate,
    attendanceRate,
    setFilters,
    setSearch,
    setOrdering,
    resetQuery,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getAttendanceReport,
    markRegistrationAttended,
    refresh,
  } = useEvents();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(search);
  const [formState, setFormState] = useState({ open: false, mode: 'create', event: null });
  const [attendanceState, setAttendanceState] = useState({
    open: false,
    event: null,
    loading: false,
    data: null,
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    resetQuery();
    setSearchDraft('');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
  };

  const openCreateModal = () => setFormState({ open: true, mode: 'create', event: null });

  const openEditModal = (event) => setFormState({ open: true, mode: 'edit', event });

  const closeFormModal = () => setFormState({ open: false, mode: 'create', event: null });

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (formState.mode === 'create') {
        await createEvent(payload);
      } else if (formState.event?.id) {
        await updateEvent(formState.event.id, payload);
      }
      closeFormModal();
    } finally {
      setSubmitting(false);
    }
  };

  const openAttendanceModal = async (event) => {
    setAttendanceState({
      open: true,
      event,
      loading: true,
      data: null,
      error: null,
    });
    try {
      const report = await getAttendanceReport(event.id);
      setAttendanceState((prev) => ({ ...prev, loading: false, data: report }));
    } catch (err) {
      setAttendanceState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.detail || 'Unable to load attendance report.',
      }));
    }
  };

  const closeAttendanceModal = () =>
    setAttendanceState({ open: false, event: null, loading: false, data: null, error: null });

  const handleMarkAttended = async (registrationId) => {
    try {
      await markRegistrationAttended(registrationId);
      if (attendanceState.event) {
        const refreshed = await getAttendanceReport(attendanceState.event.id);
        setAttendanceState((prev) => ({ ...prev, data: refreshed }));
      }
    } catch (err) {
      setAttendanceState((prev) => ({
        ...prev,
        error: err.response?.data?.detail || 'Unable to mark attendance.',
      }));
    }
  };

  return (
    <div className="events-shell">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="events-header-card">
          <div>
            <p className="text-sm font-semibold text-sbcc-gray uppercase tracking-wide">Page / Events</p>
            <h1 className="text-3xl md:text-4xl font-bold text-sbcc-dark">Events &amp; Attendance</h1>
            <p className="mt-2 text-sbcc-gray max-w-2xl">
              Coordinate ministry gatherings, track attendance, and keep your church community informed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton
              icon={HiOutlineFilter}
              onClick={() => setFiltersOpen((prev) => !prev)}
              className={filtersOpen ? 'bg-sbcc-light-orange/60' : undefined}
            >
              {filtersOpen ? 'Hide Filters' : 'Filter'}
            </SecondaryButton>
            <SecondaryButton icon={HiOutlineRefresh} onClick={refresh}>
              Refresh
            </SecondaryButton>
            <SecondaryButton
              icon={HiOutlineCalendar}
              onClick={() => setShowCalendar((prev) => !prev)}
              className={showCalendar ? 'bg-sbcc-light-orange/60' : undefined}
            >
              {showCalendar ? 'List View' : 'Calendar'}
            </SecondaryButton>
            {canManageEvents && (
              <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreateModal}>
                New Event
              </PrimaryButton>
            )}
          </div>
        </header>

        <EventsSummaryCards
          summary={summary}
          completionRate={completionRate}
          attendanceRate={attendanceRate}
        />

        <EventsFilters
          open={filtersOpen}
          filters={filters}
          searchDraft={searchDraft}
          ordering={ordering}
          onSearchChange={setSearchDraft}
          onSearchSubmit={handleSearchSubmit}
          onFilterChange={handleFilterChange}
          onOrderingChange={setOrdering}
          onReset={handleResetFilters}
        />

        {error && (
          <div className="events-banner events-banner--error">
            <span>{error}</span>
          </div>
        )}

        <section className="events-board">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" />
              <p className="mt-3 text-sbcc-gray">Loading events...</p>
            </div>
          ) : showCalendar ? (
            <EventsCalendar events={events} />
          ) : (
            <EventsBoard
              events={events}
              loading={loading}
              canManage={canManageEvents}
              onCreate={openCreateModal}
              onEdit={openEditModal}
              onDelete={(event) => {
                if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                  deleteEvent(event.id);
                }
              }}
              onRegister={(event) => registerForEvent(event.id)}
              onUnregister={(event) => unregisterFromEvent(event.id)}
              onAttendance={openAttendanceModal}
            />
          )}
        </section>
      </div>

      <EventModal
        open={formState.open}
        size="xl"
        title={formState.mode === 'create' ? 'Create Event' : 'Update Event'}
        onClose={closeFormModal}
      >
        <EventsForm
          initialValues={prepareEventFormValues(formState.event)}
          submitting={submitting}
          onCancel={closeFormModal}
          onSubmit={handleFormSubmit}
        />
      </EventModal>

  <EventModal
        open={attendanceState.open}
        size="5xl"
        title="Attendance Overview"
        onClose={closeAttendanceModal}
      >
        <AttendanceModalContent
          loading={attendanceState.loading}
          error={attendanceState.error}
          report={attendanceState.data}
          canManage={canManageEvents}
          onMarkAttended={handleMarkAttended}
        />
      </EventModal>
    </div>
  );
};

export default EventsPage;