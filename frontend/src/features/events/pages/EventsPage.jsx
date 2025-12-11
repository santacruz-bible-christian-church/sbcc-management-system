import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlinePlusCircle, HiOutlineRefresh } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useSnackbar } from '../../../hooks/useSnackbar';
import {
  EventModal,
  EventsBoard,
  EventsCalendar,
  EventsFilters,
  EventsForm,
  EventsSummaryCards,
  RegistrationModal,
} from '../components';
import { MANAGER_ROLES } from '../utils/constants';
import { prepareEventFormValues } from '../utils/format';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import '../../../styles/events.css';
import '../../../styles/calendar.css';

const MAX_EVENTS_PER_PAGE = 100;

export const EventsPage = () => {
  const { user } = useAuth();
  const canManageEvents = MANAGER_ROLES.includes(user?.role);
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
  } = useSnackbar();
  const {
    events,
    loading,
    error,
    filters,
    search,
    ordering,
    summary,
    completionRate,
    setFilters,
    setSearch,
    setOrdering,
    resetQuery,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    listRegistrations,
    refresh,
  } = useEvents();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(search);
  const [formState, setFormState] = useState({ open: false, mode: 'create', event: null });
  const [deleteState, setDeleteState] = useState({ open: false, event: null });
  const [registrationState, setRegistrationState] = useState({
    open: false,
    event: null,
    loading: false,
    data: null,
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
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
      const finalPayload = {
        ...payload,
        organizer: user.id,
      };

      if (formState.mode === 'create') {
        await createEvent(finalPayload);
        showSuccess('Event created successfully!');
      } else if (formState.event?.id) {
        await updateEvent(formState.event.id, finalPayload);
        showSuccess('Event updated successfully!');
      }
      closeFormModal();
    } catch (err) {
      console.error('❌ Form submission error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      console.error('Payload sent:', payload);

      // Show detailed error
      const errorData = err.response?.data;
      let errorMsg = 'Failed to save event.';

      if (errorData) {
        if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else {
          // Show all field errors
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorList = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorList.join(', ')}`;
            })
            .join('\n');
          errorMsg = fieldErrors || 'Validation failed.';
        }
      }

      showError(errorMsg);
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

    setSubmitting(true);
    try {
      await deleteEvent(deleteState.event.id);
      showSuccess('Event deleted successfully!');
      closeDeleteModal();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to delete event. Please try again.';
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openRegistrationModal = useCallback(
    async (event) => {
      let cancelled = false;

      setRegistrationState({
        open: true,
        event,
        loading: true,
        data: null,
        error: null,
      });
      try {
        const registrations = await listRegistrations(event.id);
        if (!cancelled) {
          setRegistrationState((prev) => ({ ...prev, loading: false, data: registrations }));
        }
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err.response?.data?.detail || 'Unable to load registrations.';
          setRegistrationState((prev) => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [listRegistrations]
  );

  const closeRegistrationModal = useCallback(() => {
    setRegistrationState({ open: false, event: null, loading: false, data: null, error: null });
  }, []);

  const handleRegister = useCallback(
    async (event) => {
      const eventId = event.id;
      setActionLoading((prev) => ({ ...prev, [`register-${eventId}`]: true }));
      try {
        await registerForEvent(eventId);
        showSuccess(`Successfully registered for "${event.title}"!`);
      } catch (err) {
        const errorMsg = err.response?.data?.detail ||
                         err.response?.data?.message ||
                         'Failed to register. Please try again.';
        showError(errorMsg);
      } finally {
        setActionLoading((prev) => ({ ...prev, [`register-${eventId}`]: false }));
      }
    },
    [registerForEvent, showSuccess, showError]
  );

  const handleUnregister = useCallback(
    async (event) => {
      const eventId = event.id;
      setActionLoading((prev) => ({ ...prev, [`unregister-${eventId}`]: true }));
      try {
        await unregisterFromEvent(eventId);
        showSuccess(`Successfully unregistered from "${event.title}".`);
      } catch (err) {
        const errorMsg = err.response?.data?.detail ||
                         err.response?.data?.message ||
                         'Failed to unregister. Please try again.';
        showError(errorMsg);
      } finally {
        setActionLoading((prev) => ({ ...prev, [`unregister-${eventId}`]: false }));
      }
    },
    [unregisterFromEvent, showSuccess, showError]
  );

  const isLoading = loading || submitting;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="space-y-8">
        <header className="events-header-card">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-sbcc-dark">Events Management</h1>
            <p className="mt-2 text-sbcc-gray max-w-2xl">
              Coordinate ministry gatherings, manage RSVPs, and keep your church community informed.
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
              actionLoading={actionLoading}
              canManage={canManageEvents}
              onCreate={openCreateModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              onViewRegistrations={openRegistrationModal}
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
      {/* NOTE: Updated to use two-column confirmation modal with illustration
          (Trash-WarmTone.svg) — matches other delete modals across the app.
          Illustration is passed via the `illustration` prop so it remains configurable. */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete Event?"
        message={`Are you sure you want to delete "${deleteState.event?.title}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={submitting}
      />

      {/* Registration Modal */}
      <EventModal
        open={registrationState.open}
        size="4xl"
        title="Event Registrations"
        onClose={closeRegistrationModal}
      >
        <RegistrationModal
          loading={registrationState.loading}
          error={registrationState.error}
          event={registrationState.event}
          registrations={registrationState.data}
        />
      </EventModal>

      {/* Snackbar Notifications */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </div>
  );
};

export default EventsPage;
