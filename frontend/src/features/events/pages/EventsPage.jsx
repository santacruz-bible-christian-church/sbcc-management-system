import { useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useEventsPageModals } from '../hooks/useEventsPageModals';
import { useEventsPageActions } from '../hooks/useEventsPageActions';
import { useSnackbar } from '../../../hooks/useSnackbar';
import {
  EventModal,
  EventsBoard,
  EventsCalendar,
  EventsFilters,
  EventsForm,
  EventDetailsModal,
  RegistrationModal,
  EventsToolbar,
} from '../components';
import EventsSidebar from '../components/EventsSidebar';
import EventsQuickAdd from '../components/EventsQuickAdd';
import { EventsSkeleton } from '../components/EventsSkeleton';

import { MANAGER_ROLES } from '../utils/constants';
import { prepareEventFormValues } from '../utils/format';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import '../../../styles/events.css';
import '../../../styles/calendar.css';

export const EventsPage = () => {
  const { user } = useAuth();
  const canManageEvents = MANAGER_ROLES.includes(user?.role);
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const {
    events,
    loading,
    error,
    filters,
    search,
    ordering,
    pagination,
    summary,
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

  // Local UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(search);
  const [showCalendar, setShowCalendar] = useState(true);

  // Modal states (extracted to hook)
  const modals = useEventsPageModals({ listRegistrations });

  // Action handlers (extracted to hook)
  const actions = useEventsPageActions({
    user,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    refresh,
    showSuccess,
    showError,
    modals,
  });

  // Sync search draft with API search
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  // Filter handlers
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    resetQuery();
    setSearchDraft('');
  };

  const handleSearchSubmit = (event) => {
    if (event) event.preventDefault();
    setSearch(searchDraft.trim());
  };

  const isLoading = loading || modals.submitting;

  // Show skeleton on initial load only
  if (loading && events.length === 0) {
    return <EventsSkeleton />;
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="space-y-6">
        {/* Unified Toolbar */}
        <EventsToolbar
          showCalendar={showCalendar}
          onToggleView={() => setShowCalendar((prev) => !prev)}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          onRefresh={refresh}
          onCreateClick={modals.openCreateModal}
          canManage={canManageEvents}
          isLoading={isLoading}
          summary={summary}
        />

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
                <EventsCalendar events={events} onEventClick={modals.openDetailsModal} />
              )}

              {/* Inline Quick Add Form */}
              {canManageEvents && (
                <EventsQuickAdd onCreate={actions.handleQuickAdd} submitting={modals.submitting} />
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="xl:sticky xl:top-8 h-[calc(100vh-100px)]">
              <EventsSidebar
                events={events}
                search={searchDraft}
                onSearchChange={setSearchDraft}
                onSearchSubmit={handleSearchSubmit}
                onEventClick={modals.openDetailsModal}
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
                  actionLoading={modals.actionLoading}
                  canManage={canManageEvents}
                  onCreate={modals.openCreateModal}
                  onEdit={modals.openEditModal}
                  onDelete={modals.openDeleteModal}
                  onRegister={actions.handleRegister}
                  onUnregister={actions.handleUnregister}
                  onViewDetails={modals.openDetailsModal}
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
        open={modals.detailsState.open}
        event={modals.detailsState.event}
        onClose={modals.closeDetailsModal}
        canManage={canManageEvents}
        onEdit={(event) => {
          modals.closeDetailsModal();
          modals.openEditModal(event);
        }}
      />

      {/* Event Create/Edit Modal - Full Form */}
      <EventModal
        open={modals.formState.open}
        size="xl"
        title={modals.formState.mode === 'create' ? 'Create Event' : 'Update Event'}
        onClose={modals.closeFormModal}
      >
        <EventsForm
          initialValues={prepareEventFormValues(modals.formState.event)}
          submitting={modals.submitting}
          onCancel={modals.closeFormModal}
          onSubmit={actions.handleFormSubmit}
        />
      </EventModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={modals.deleteState.open}
        title="Delete Event?"
        message={`Are you sure you want to delete "${modals.deleteState.event?.title}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={actions.handleDeleteConfirm}
        onCancel={modals.closeDeleteModal}
        loading={modals.submitting}
      />

      {/* Registration Modal */}
      <EventModal
        open={modals.registrationState.open}
        size="4xl"
        title="Event Registrations"
        onClose={modals.closeRegistrationModal}
      >
        <RegistrationModal
          loading={modals.registrationState.loading}
          error={modals.registrationState.error}
          event={modals.registrationState.event}
          registrations={modals.registrationState.data}
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
