import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlineFilter, HiOutlinePlusCircle, HiOutlineSearch } from 'react-icons/hi';
import { useTasks } from '../hooks/useTasks';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
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

export const TasksPage = () => {
  const { canWrite } = usePermissionWarning('tasks', { label: 'Tasks' });
  const canManageTasks = canWrite;
  const { snackbar, hideSnackbar, showSuccess, showError, showWarning } = useSnackbar();
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
    reopenTask,
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

  const requireWritePermission = useCallback(() => {
    if (!canManageTasks) {
      showWarning("You don't have permission to perform this action.");
      return false;
    }
    return true;
  }, [canManageTasks, showWarning]);

  const openCreateModal = useCallback(() => {
    if (!requireWritePermission()) return;
    setFormState({ open: true, mode: 'create', task: null });
  }, [requireWritePermission]);

  const openEditModal = useCallback((task) => {
    if (!requireWritePermission()) return;
    setFormState({ open: true, mode: 'edit', task });
  }, [requireWritePermission]);

  const closeFormModal = useCallback(() => {
    setFormState({ open: false, mode: 'create', task: null });
  }, []);

  const handleFormSubmit = async (payload) => {
    if (!requireWritePermission()) return;
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
    if (!requireWritePermission()) return;
    setDeleteState({ open: true, task });
  }, [requireWritePermission]);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, task: null });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteState.task) return;
    if (!requireWritePermission()) return;

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
    if (!requireWritePermission()) return;
    const statusLabels = {
      pending: 'To Do',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue',
    };

    // Find the task to check its effective status
    const task = tasks.find(t => t.id === taskId);
    const currentStatus = task?.effective_status || task?.status;

    // Prevent moving overdue tasks back to pending/in_progress
    if (currentStatus === 'overdue' && ['pending', 'in_progress'].includes(newStatus)) {
      showError('Cannot move overdue task to "' + statusLabels[newStatus] + '". Please extend the due date or mark as completed.');
      return;
    }

    // Prevent moving completed tasks (use Reopen action instead)
    if (currentStatus === 'completed' && newStatus !== 'completed') {
      showError('Cannot move completed task. Use the "Reopen" action to reopen this task.');
      return;
    }

    // Prevent moving cancelled tasks
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      showError('Cannot move cancelled task. Use the "Reopen" action to reopen this task.');
      return;
    }

    try {
      await updateTask(taskId, { status: newStatus });
      showSuccess(`Task moved to "${statusLabels[newStatus] || newStatus}"`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update status.';
      showError(errorMsg);
    }
  };

  const handleReopen = async (task) => {
    if (!requireWritePermission()) return;
    try {
      await reopenTask(task.id);
      showSuccess(`Task "${task.title}" has been reopened`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to reopen task.';
      showError(errorMsg);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-6">
      {/* Stats Cards Row */}
      <TaskStatisticsCards statistics={statistics} />

      {/* Action Bar: Search + Filters + Buttons */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all"
            />
          </div>
        </form>

        {/* Filters Toggle */}
        <SecondaryButton
          icon={HiOutlineFilter}
          onClick={() => setFiltersOpen((prev) => !prev)}
          className={filtersOpen ? 'bg-gray-100' : undefined}
        >
          Filter
        </SecondaryButton>

        {/* Add Task Button */}
        {canManageTasks && (
          <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreateModal} disabled={isLoading}>
            Add Task
          </PrimaryButton>
        )}
      </div>

      {/* Expandable Filter Panel */}
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

      {/* Kanban Board */}
      <section>
        {loading && !tasks.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="xl" />
            <p className="mt-3 text-sbcc-gray">Loading tasks...</p>
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            loading={loading}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onStatusChange={handleStatusChange}
            onReopen={handleReopen}
          />
        )}
      </section>

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
