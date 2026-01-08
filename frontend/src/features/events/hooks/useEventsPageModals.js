import { useState, useCallback } from 'react';

/**
 * Hook for managing all modal states in EventsPage
 * Extracted to reduce page component complexity
 */
export function useEventsPageModals({ listRegistrations }) {
  // Form modal (create/edit)
  const [formState, setFormState] = useState({ open: false, mode: 'create', event: null });

  // Delete confirmation modal
  const [deleteState, setDeleteState] = useState({ open: false, event: null });

  // Event details modal
  const [detailsState, setDetailsState] = useState({ open: false, event: null });

  // Registration modal
  const [registrationState, setRegistrationState] = useState({
    open: false,
    event: null,
    loading: false,
    data: null,
    error: null,
  });

  // Submitting state (shared across form operations)
  const [submitting, setSubmitting] = useState(false);

  // Action loading state (for register/unregister buttons)
  const [actionLoading, setActionLoading] = useState({});

  // === Form Modal Handlers ===
  const openCreateModal = useCallback(() => {
    setFormState({ open: true, mode: 'create', event: null });
  }, []);

  const openEditModal = useCallback((event) => {
    setFormState({ open: true, mode: 'edit', event });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormState({ open: false, mode: 'create', event: null });
  }, []);

  // === Details Modal Handlers ===
  const openDetailsModal = useCallback((event) => {
    setDetailsState({ open: true, event });
  }, []);

  const closeDetailsModal = useCallback(() => {
    setDetailsState({ open: false, event: null });
  }, []);

  // === Delete Modal Handlers ===
  const openDeleteModal = useCallback((event) => {
    setDeleteState({ open: true, event });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, event: null });
  }, []);

  // === Registration Modal Handlers ===
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

  return {
    // States
    formState,
    deleteState,
    detailsState,
    registrationState,
    submitting,
    actionLoading,

    // Setters (for action handlers)
    setSubmitting,
    setActionLoading,

    // Form Modal
    openCreateModal,
    openEditModal,
    closeFormModal,

    // Details Modal
    openDetailsModal,
    closeDetailsModal,

    // Delete Modal
    openDeleteModal,
    closeDeleteModal,

    // Registration Modal
    openRegistrationModal,
    closeRegistrationModal,
  };
}

export default useEventsPageModals;
