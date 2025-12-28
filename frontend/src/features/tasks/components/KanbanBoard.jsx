import { useMemo, useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { TaskDetailsView } from './TaskDetailsView';

export const KanbanBoard = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      pending: [],
      in_progress: [],
      overdue: [],
      completed: [],
      cancelled: [],
    };

    tasks.forEach((task) => {
      // If task is overdue and not completed/cancelled, put it in overdue column
      // Backend handles setting status to 'overdue' automatically, but we can double check here
      // or just rely on the status field if the backend is doing its job.
      // Based on the user request, they want explicit columns.
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [tasks]);

  const handleDrop = async (task, newStatus) => {
    await onStatusChange(task.id, newStatus);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTask(null);
  };

  // Only show loading spinner on initial load when there are no tasks
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sbcc-gray">Loading tasks...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-8">
        <KanbanColumn
          status="pending"
          tasks={tasksByStatus.pending}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          onTaskEdit={onEdit}
          onTaskDelete={onDelete}
        />
        <KanbanColumn
          status="in_progress"
          tasks={tasksByStatus.in_progress}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          onTaskEdit={onEdit}
          onTaskDelete={onDelete}
        />
        <KanbanColumn
          status="overdue"
          tasks={tasksByStatus.overdue}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          onTaskEdit={onEdit}
          onTaskDelete={onDelete}
        />
        <KanbanColumn
          status="completed"
          tasks={tasksByStatus.completed}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          onTaskEdit={onEdit}
          onTaskDelete={onDelete}
        />
        <KanbanColumn
          status="cancelled"
          tasks={tasksByStatus.cancelled}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          onTaskEdit={onEdit}
          onTaskDelete={onDelete}
        />
      </div>

      {/* Task Details Modal */}
      <TaskModal
        open={detailsModalOpen}
        title="Task Details"
        onClose={closeDetailsModal}
        size="xl"
      >
        {selectedTask && (
          <TaskDetailsView
            task={selectedTask}
            onEdit={() => {
              closeDetailsModal();
              onEdit(selectedTask);
            }}
            onDelete={() => {
              closeDetailsModal();
              onDelete(selectedTask);
            }}
            onClose={closeDetailsModal}
          />
        )}
      </TaskModal>
    </>
  );
};
