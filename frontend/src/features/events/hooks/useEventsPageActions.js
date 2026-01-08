import { useCallback } from 'react';

/**
 * Hook for handling event CRUD and registration actions
 * Extracted to reduce page component complexity
 */
export function useEventsPageActions({
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
}) {
  const {
    formState,
    deleteState,
    detailsState,
    closeFormModal,
    closeDeleteModal,
    closeDetailsModal,
    setSubmitting,
    setActionLoading,
  } = modals;

  // Create or Update event
  const handleFormSubmit = useCallback(async (payload) => {
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
      console.error('Form submission error:', err);
      showError('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  }, [user, formState, detailsState, createEvent, updateEvent, closeFormModal, closeDetailsModal, refresh, showSuccess, showError, setSubmitting]);

  // Quick Add (from calendar view)
  const handleQuickAdd = useCallback(async (payload) => {
    setSubmitting(true);
    try {
      const finalPayload = {
        ...payload,
        organizer: user.id,
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
  }, [user, createEvent, refresh, showSuccess, showError, setSubmitting]);

  // Delete event
  const handleDeleteConfirm = useCallback(async () => {
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
  }, [deleteState.event, deleteEvent, closeDeleteModal, showSuccess, showError, setSubmitting]);

  // Register for event
  const handleRegister = useCallback(async (event) => {
    const eventId = event.id;
    setActionLoading((prev) => ({ ...prev, [`register-${eventId}`]: true }));
    try {
      await registerForEvent(eventId);
      showSuccess(`Successfully registered for "${event.title}"!`);
      refresh();
    } catch (err) {
      const errorMsg = err.response?.data?.detail ||
                       err.response?.data?.message ||
                       'Failed to register. Please try again.';
      showError(errorMsg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`register-${eventId}`]: false }));
    }
  }, [registerForEvent, refresh, showSuccess, showError, setActionLoading]);

  // Unregister from event
  const handleUnregister = useCallback(async (event) => {
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
  }, [unregisterFromEvent, refresh, showSuccess, showError, setActionLoading]);

  return {
    handleFormSubmit,
    handleQuickAdd,
    handleDeleteConfirm,
    handleRegister,
    handleUnregister,
  };
}

export default useEventsPageActions;
