import { useState } from 'react';
import { TaskCardKanban } from './TaskCardKanban';

const statusConfig = {
  pending: {
    title: 'To Do',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-50', // Light red background for the whole column
    headerColor: 'text-gray-900',
  },
  in_progress: {
    title: 'In progress',
    dotColor: 'bg-orange-400',
    bgColor: 'bg-orange-50', // Light orange background
    headerColor: 'text-gray-900',
  },
  overdue: {
    title: 'Overdue',
    dotColor: 'bg-red-600',
    bgColor: 'bg-red-100',
    headerColor: 'text-red-900',
  },
  completed: {
    title: 'Completed',
    dotColor: 'bg-green-500',
    bgColor: 'bg-green-50', // Light green background
    headerColor: 'text-gray-900',
  },
  cancelled: {
    title: 'Cancelled',
    dotColor: 'bg-gray-500',
    bgColor: 'bg-gray-50',
    headerColor: 'text-gray-900',
  },
};

export const KanbanColumn = ({
  status,
  tasks,
  onDrop,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isDragOver, setIsDragOver] = useState(false);
  const config = statusConfig[status];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const taskData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (taskData.status !== status) {
        onDrop(taskData, status);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full min-w-[350px] w-[350px] rounded-2xl ${config.bgColor} p-4`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          <h3 className={`font-bold text-base ${config.headerColor}`}>
            {config.title}
          </h3>
          <span className="bg-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-gray-600 shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Body */}
      {!isCollapsed && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 space-y-3 overflow-y-auto transition-all custom-scrollbar ${isDragOver ? 'ring-2 ring-blue-400 ring-inset rounded-lg bg-white/50' : ''
            }`}
          style={{ minHeight: '400px', maxHeight: 'calc(100vh - 350px)' }}
        >
          {tasks.length === 0 ? (
            <div className="h-32 border-2 border-dashed border-gray-300/50 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
              No tasks
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCardKanban
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
