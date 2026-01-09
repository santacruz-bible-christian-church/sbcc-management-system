import { format } from 'date-fns';

const priorityConfig = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-600' },
  high: { label: 'High', className: 'bg-red-100 text-red-600' },
  medium: { label: 'Medium', className: 'bg-orange-100 text-orange-600' },
  low: { label: 'Low', className: 'bg-blue-100 text-blue-600' },
};

export const TaskCardKanban = ({ task, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  // Get initials from assigned user name
  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1][0]}.`;
    }
    return name;
  };

  const effectiveStatus = task.effective_status || task.status;
  const isCompleted = effectiveStatus === 'completed';
  const priorityStyle = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(task)}
      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-gray-200"
    >
      {/* Header: Title + Priority/Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-bold text-gray-900 text-base leading-tight pr-2">
          {task.title}
        </h4>
        {isCompleted ? (
          <span className="shrink-0 px-2.5 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
            Completed
          </span>
        ) : (
          <span className={`shrink-0 px-2.5 py-1 rounded text-xs font-semibold ${priorityStyle.className}`}>
            {priorityStyle.label}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
        {task.description || 'No description provided.'}
      </p>

      {/* Footer: Assignee + Date */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {/* Assignee Badge */}
        {task.assigned_to_name ? (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${isCompleted ? 'bg-green-600' :
              effectiveStatus === 'in_progress' ? 'bg-orange-400' :
                'bg-red-500'
            }`}>
            {getInitials(task.assigned_to_name)}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">Unassigned</span>
        )}

        {/* Date */}
        <span className="text-xs font-medium text-gray-500">
          {isCompleted && task.completed_at ? (
            `Completed ${format(new Date(task.completed_at), 'MMM d')}`
          ) : (
            `Due: ${format(new Date(task.end_date), 'MMM d')}`
          )}
        </span>
      </div>
    </div>
  );
};
