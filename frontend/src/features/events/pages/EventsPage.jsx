import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlineCalendar, HiOutlineFilter, HiOutlinePlusCircle, HiOutlineRefresh, HiViewList } from 'react-icons/hi';
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
  EventDetailsModal,
} from '../components';
import EventsSidebar from '../components/EventsSidebar';
import EventsQuickAdd from '../components/EventsQuickAdd';

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
    pagination,
    summary,
    completionRate,
    setFilters,
    setSearch,
    setOrdering,
    goToPage,
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
  const [detailsState, setDetailsState] = useState({ open: false, event: null });
  const [registrationState, setRegistrationState] = useState({
    open: false,
    event: null,
    loading: false,
    data: null,
    error: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  // Default to true for the new design (Calendar view by default)
  const [showCalendar, setShowCalendar] = useState(true);

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
    if (event) event.preventDefault();
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

  const openDetailsModal = useCallback((event) => {
    setDetailsState({ open: true, event });
  }, []);

  const closeDetailsModal = useCallback(() => {
    setDetailsState({ open: false, event: null });
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
      // If editing from details modal, refresh it
      if (detailsState.open && detailsState.event?.id === formState.event?.id) {
          closeDetailsModal();
          refresh();
      }

    } catch (err) {
      console.error('❌ Form submission error:', err);
      // Error handling logic omitted for brevity, same as before
      showError('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Add Handler
  const handleQuickAdd = async (payload) => {
      setSubmitting(true);
      try {
        const finalPayload = {
            ...payload,
            organizer: user.id
        };
        await createEvent(finalPayload);
        showSuccess('Event scheduled successfully!');
        refresh();
      } catch (err) {
         showError('Failed to schedule event.');
         console.error(err);
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
        // Refresh to update availability
        refresh();
      } catch (err) {
        const errorMsg = err.response?.data?.detail ||
                         err.response?.data?.message ||
                         'Failed to register. Please try again.';
        showError(errorMsg);
      } finally {
        setActionLoading((prev) => ({ ...prev, [`register-${eventId}`]: false }));
      }
    },
    [registerForEvent, showSuccess, showError, refresh]
  );

  const handleUnregister = useCallback(
    async (event) => {
      const eventId = event.id;
      setActionLoading((prev) => ({ ...prev, [`unregister-${eventId}`]: true }));
      try {
        await unregisterFromEvent(eventId);
        showSuccess(`Successfully unregistered from "${event.title}".`);
        refresh();
      } catch (err) {
        const errorMsg = err.response?.data?.detail ||
                         err.response?.data?.message ||
                         'Failed to unregister. Please try again.';
        showError(errorMsg);
      } finally {
        setActionLoading((prev) => ({ ...prev, [`unregister-${eventId}`]: false }));
      }
    },
    [unregisterFromEvent, showSuccess, showError, refresh]
  );

  const isLoading = loading || submitting;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="space-y-6">
        {/* Unified Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
          {/* Left: Stats (Board View only) or empty space */}
          <div className="flex items-center">
            {!showCalendar && <EventsSummaryCards summary={summary} />}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Board View specific actions */}
            {!showCalendar && (
              <>
                <SecondaryButton
                  icon={HiOutlineRefresh}
                  onClick={refresh}
                  disabled={isLoading}
                >
                  Refresh
                </SecondaryButton>
                <SecondaryButton
                  icon={HiOutlineFilter}
                  onClick={() => setFiltersOpen((prev) => !prev)}
                  className={filtersOpen ? 'bg-sbcc-light-orange/60' : undefined}
                >
                  {filtersOpen ? 'Hide Filters' : 'Filter'}
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

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-1" />
              </>
            )}

            {/* View Toggle - Always visible */}
            <SecondaryButton
              icon={showCalendar ? HiViewList : HiOutlineCalendar}
              onClick={() => setShowCalendar((prev) => !prev)}
            >
              {showCalendar ? 'Board View' : 'Calendar'}
            </SecondaryButton>
          </div>
        </div>

        {/* Split Layout for Calendar View */}
        {showCalendar ? (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">

                {/* Left Column: Calendar + Quick Add */}
                <div className="space-y-8">
                    {loading && !events.length ? (
                         <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
                            <Spinner size="xl" />
                            <p className="mt-3 text-sbcc-gray">Loading events...</p>
                        </div>
                    ) : (
                        <EventsCalendar events={events} onEventClick={openDetailsModal} />
                    )}

                    {/* Inline Quick Add Form */}
                    {canManageEvents && (
                        <EventsQuickAdd onCreate={handleQuickAdd} submitting={submitting} />
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="xl:sticky xl:top-8 h-[calc(100vh-100px)]">
                    <EventsSidebar
                        events={events}
                        search={searchDraft}
                        onSearchChange={setSearchDraft}
                        onSearchSubmit={handleSearchSubmit}
                        onEventClick={openDetailsModal}
                        onViewAll={() => setShowCalendar(false)}
                    />
                </div>
            </div>
        ) : (
            /* Board View - Compact and clean */
            <>
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

                <section className="events-board">
                    {loading && !events.length ? (
                        <div className="flex flex-col items-center justify-center py-20">
                        <Spinner size="xl" />
                        <p className="mt-3 text-sbcc-gray">Loading events...</p>
                        </div>
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
                        onViewDetails={openDetailsModal}
                        />
                    )}
                </section>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => goToPage(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevious || loading}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let page;
                        if (pagination.totalPages <= 5) {
                          page = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          page = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          page = pagination.totalPages - 4 + i;
                        } else {
                          page = pagination.currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            disabled={loading}
                            className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                              page === pagination.currentPage
                                ? 'bg-[#FDB54A] text-white'
                                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => goToPage(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext || loading}
                      className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>

                    <span className="ml-4 text-sm text-gray-500">
                      Page {pagination.currentPage} of {pagination.totalPages} ({pagination.count} events)
                    </span>
                  </div>
                )}
            </>
        )}

        {error && (
          <div className="events-banner events-banner--error" role="alert">
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        open={detailsState.open}
        event={detailsState.event}
        onClose={closeDetailsModal}
        canManage={canManageEvents}
        onEdit={(event) => {
            closeDetailsModal();
            openEditModal(event);
        }}
      />

      {/* Event Create/Edit Modal - Full Form */}
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
