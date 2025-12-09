import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlineFilter, HiOutlinePlusCircle, HiOutlineRefresh } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useSnackbar } from '../../../hooks/useSnackbar';
import {
  TaskModal,
  KanbanBoard,
  TaskFilters,
  TaskForm,
  TaskStatisticsCards,
} from '../components';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';

const MANAGER_ROLES = ['admin', 'pastor', 'ministry_leader'];

export const TasksPage = () => {
  const { user } = useAuth();
  const canManageTasks = MANAGER_ROLES.includes(user?.role);
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const {
    tasks,
    loading,
    error,
    filters,
    search,
    ordering,
    statistics,
    setFilters,
    setSearch,
    setOrdering,
    resetQuery,
    createTask,
    updateTask,
    deleteTask,
    refresh,
  } = useTasks();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(search);
  const [formState, setFormState] = useState({ open: false, mode: 'create', task: null });
  const [deleteState, setDeleteState] = useState({ open: false, task: null });
  const [submitting, setSubmitting] = useState(false);

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
    setFormState({ open: true, mode: 'create', task: null });
  }, []);

  const openEditModal = useCallback((task) => {
    setFormState({ open: true, mode: 'edit', task });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormState({ open: false, mode: 'create', task: null });
  }, []);

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (formState.mode === 'create') {
        await createTask(payload);
        showSuccess('Task created successfully!');
      } else if (formState.task?.id) {
        await updateTask(formState.task.id, payload);
        showSuccess('Task updated successfully!');
      }
      closeFormModal();
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to save task.';
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = useCallback((task) => {
    setDeleteState({ open: true, task });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, task: null });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteState.task) return;

    setSubmitting(true);
    try {
      await deleteTask(deleteState.task.id);
      showSuccess('Task deleted successfully!');
      closeDeleteModal();
    } catch (err) {
      console.error('Delete error:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to delete task.';
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      showSuccess('Task status updated!');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update status.';
      showError(errorMsg);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-8">
      <div className="space-y-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Page/Kanban</p>
            <h1 className="text-3xl font-bold text-gray-900">Kanban</h1>
          </div>
          <div className="flex items-center gap-3">
            <SecondaryButton
              icon={HiOutlineFilter}
              onClick={() => setFiltersOpen((prev) => !prev)}
              className={filtersOpen ? 'bg-gray-100' : undefined}
            >
              Filter
            </SecondaryButton>
            {canManageTasks && (
              <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreateModal} disabled={isLoading}>
                Add Task
              </PrimaryButton>
            )}
          </div>
        </header>

        <TaskStatisticsCards statistics={statistics} />

        <TaskFilters
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <section>
          {loading && !tasks.length ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" />
              <p className="mt-3 text-sbcc-gray">Loading tasks...</p>
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              loading={isLoading}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onStatusChange={handleStatusChange}
            />
          )}
        </section>
      </div>

      <TaskModal
        open={formState.open}
        size="xl"
        title={formState.mode === 'create' ? 'Create Task' : 'Update Task'}
        onClose={closeFormModal}
      >
        <TaskForm
          initialValues={formState.task}
          submitting={submitting}
          onCancel={closeFormModal}
          onSubmit={handleFormSubmit}
        />
      </TaskModal>

      <ConfirmationModal
        open={deleteState.open}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteState.task?.title}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={submitting}
      />

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

export default TasksPage;
