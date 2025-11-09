import { useCallback, useEffect, useState } from 'react';
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
import { ConfirmationModal } from '../../../components/ui/Modal';
import '../../../styles/events.css';
import '../../../styles/calendar.css';

const MAX_EVENTS_PER_PAGE = 100;

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
  const [deleteState, setDeleteState] = useState({ open: false, event: null });
  const [attendanceState, setAttendanceState] = useState({
    open: false,
    event: null,
    loading: false,
    data: null,
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [mutating, setMutating] = useState(false);
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

  const openCreateModal = useCallback(() => {
    setFormState({ open: true, mode: 'create', event: null });
  }, []);

  const openEditModal = useCallback((event) => {
    setFormState({ open: true, mode: 'edit', event });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormState({ open: false, mode: 'create', event: null });
  }, []);

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (formState.mode === 'create') {
        await createEvent(payload);
      } else if (formState.event?.id) {
        await updateEvent(formState.event.id, payload);
      }
      closeFormModal();
    } catch (err) {
      // Error already handled by useEvents hook
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = useCallback((event) => {
    setDeleteState({ open: true, event });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, event: null });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteState.event) return;

    setMutating(true);
    try {
      await deleteEvent(deleteState.event.id);
      closeDeleteModal();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setMutating(false);
    }
  };

  const openAttendanceModal = useCallback(
    async (event) => {
      let cancelled = false;

      setAttendanceState({
        open: true,
        event,
        loading: true,
        data: null,
        error: null,
      });
      try {
        const report = await getAttendanceReport(event.id);
        if (!cancelled) {
          setAttendanceState((prev) => ({ ...prev, loading: false, data: report }));
        }
      } catch (err) {
        if (!cancelled) {
          setAttendanceState((prev) => ({
            ...prev,
            loading: false,
            error: err.response?.data?.detail || 'Unable to load attendance report.',
          }));
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [getAttendanceReport]
  );

  const closeAttendanceModal = useCallback(() => {
    setAttendanceState({ open: false, event: null, loading: false, data: null, error: null });
  }, []);

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

  const handleRegister = useCallback(
    async (event) => {
      setMutating(true);
      try {
        await registerForEvent(event.id);
      } finally {
        setMutating(false);
      }
    },
    [registerForEvent]
  );

  const handleUnregister = useCallback(
    async (event) => {
      setMutating(true);
      try {
        await unregisterFromEvent(event.id);
      } finally {
        setMutating(false);
      }
    },
    [unregisterFromEvent]
  );

  const isLoading = loading || mutating;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="space-y-8">
        <header className="events-header-card">
          <div>
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
              aria-expanded={filtersOpen}
              aria-controls="events-filters"
            >
              {filtersOpen ? 'Hide Filters' : 'Filter'}
            </SecondaryButton>
            <SecondaryButton
              icon={HiOutlineRefresh}
              onClick={refresh}
              disabled={isLoading}
            >
              Refresh
            </SecondaryButton>
            <SecondaryButton
              icon={HiOutlineCalendar}
              onClick={() => setShowCalendar((prev) => !prev)}
              className={showCalendar ? 'bg-sbcc-light-orange/60' : undefined}
              aria-expanded={showCalendar}
            >
              {showCalendar ? 'List View' : 'Calendar'}
            </SecondaryButton>
            {canManageEvents && (
              <PrimaryButton
                icon={HiOutlinePlusCircle}
                onClick={openCreateModal}
                disabled={isLoading}
              >
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
          id="events-filters"
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
          <div className="events-banner events-banner--error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <section className="events-board">
          {loading && !events.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" />
              <p className="mt-3 text-sbcc-gray">Loading events...</p>
            </div>
          ) : showCalendar ? (
            <EventsCalendar events={events} />
          ) : (
            <EventsBoard
              events={events}
              loading={isLoading}
              canManage={canManageEvents}
              onCreate={openCreateModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              onAttendance={openAttendanceModal}
            />
          )}
        </section>
      </div>

      {/* Event Create/Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete Event?"
        message={`Are you sure you want to delete "${deleteState.event?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={mutating}
      />

      {/* Attendance Modal */}
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
