import { HiCalendar, HiClock, HiUser, HiUserGroup, HiPencil, HiTrash, HiPaperClip, HiRefresh } from 'react-icons/hi';
import { format } from 'date-fns';

const priorityColors = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const TaskDetailsView = ({ task, onEdit, onDelete, onReopen, onClose }) => {
  const effectiveStatus = task.effective_status || task.status;
  const canReopen = ['completed', 'cancelled'].includes(effectiveStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-sbcc-dark mb-3">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[effectiveStatus]}`}>
              {effectiveStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {canReopen && onReopen && (
            <button
              onClick={() => onReopen(task)}
              className="p-2 text-sbcc-gray hover:text-green-600 transition-colors"
              title="Reopen task"
            >
              <HiRefresh className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-sbcc-gray hover:text-sbcc-orange transition-colors"
            title="Edit task"
          >
            <HiPencil className="h-6 w-6" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-sbcc-gray hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <HiTrash className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div>
          <h4 className="text-sm font-semibold text-sbcc-dark mb-2">Description</h4>
          <p className="text-sbcc-gray whitespace-pre-wrap">{task.description}</p>
        </div>
      )}

      {/* Timeline & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-sbcc-dark">Timeline</h4>
          <div className="flex items-center gap-3 text-sm text-sbcc-gray">
            <HiCalendar className="h-5 w-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sbcc-dark">Start Date</div>
              <div>{format(new Date(task.start_date), 'MMMM d, yyyy')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-sbcc-gray">
            <HiCalendar className="h-5 w-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sbcc-dark">End Date</div>
              <div>{format(new Date(task.end_date), 'MMMM d, yyyy')}</div>
            </div>
          </div>
          {task.days_remaining !== null && task.status !== 'completed' && task.status !== 'cancelled' && (
            <div className={`flex items-center gap-3 text-sm ${task.is_overdue ? 'text-red-600 font-medium' : 'text-sbcc-gray'}`}>
              <HiClock className="h-5 w-5 flex-shrink-0" />
              <div>
                {task.days_remaining > 0
                  ? `${task.days_remaining} days remaining`
                  : task.days_remaining === 0
                  ? 'Due today'
                  : `${Math.abs(task.days_remaining)} days overdue`}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-sbcc-dark">Assignment</h4>
          {task.assigned_to_name && (
            <div className="flex items-center gap-3 text-sm text-sbcc-gray">
              <HiUser className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sbcc-dark">Assigned To</div>
                <div>{task.assigned_to_name}</div>
              </div>
            </div>
          )}
          {task.ministry_name && (
            <div className="flex items-center gap-3 text-sm text-sbcc-gray">
              <HiUserGroup className="h-5 w-5 flex-shrink-0" />
              <div>
                <div className="font-medium text-sbcc-dark">Ministry</div>
                <div>{task.ministry_name}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-sbcc-gray">
            <HiUser className="h-5 w-5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sbcc-dark">Created By</div>
              <div>{task.created_by_name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {task.notes && (
        <div>
          <h4 className="text-sm font-semibold text-sbcc-dark mb-2">Notes</h4>
          <p className="text-sbcc-gray whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{task.notes}</p>
        </div>
      )}

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-sbcc-dark mb-2">Attachments</h4>
          {task.attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <HiPaperClip className="w-4 h-4 text-gray-400" />
                <a
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {attachment.file_name}
                </a>
                <span className="text-xs text-gray-500">
                  ({attachment.file_size_mb} MB)
                </span>
              </div>
              <button
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="text-red-600 hover:text-red-800"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completion Info */}
      {task.status === 'completed' && task.completed_at && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Completion Info</h4>
          <div className="text-sm text-green-700">
            <div>Completed on: {format(new Date(task.completed_at), 'MMMM d, yyyy h:mm a')}</div>
            {task.completed_by_name && <div>Completed by: {task.completed_by_name}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
