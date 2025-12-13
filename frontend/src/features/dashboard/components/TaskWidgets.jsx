import { useNavigate } from 'react-router-dom';
import {
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiChevronRight,
  HiOutlineClipboardList,
} from 'react-icons/hi';
import { useDashboardTasks } from '../hooks/useDashboardTasks';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const TaskItem = ({ task, showDueDate = true }) => {
  const navigate = useNavigate();

  const priorityColors = {
    urgent: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const isOverdue = isPast(new Date(task.end_date)) && !['completed', 'cancelled'].includes(task.status);

  return (
    <button
      onClick={() => navigate('/tasks')}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left group border border-transparent hover:border-gray-200"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FDB54A] transition-colors">
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
          {showDueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {format(new Date(task.end_date), 'MMM d')}
            </span>
          )}
          {task.progress_percentage > 0 && (
            <span className="text-xs text-blue-600">
              {task.progress_percentage}%
            </span>
          )}
        </div>
      </div>
      <HiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FDB54A] transition-colors" />
    </button>
  );
};

const TaskSection = ({ title, icon: Icon, tasks, iconBg, iconColor, emptyMessage, showDueDate = true }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="text-xs text-[#FDB54A] hover:text-[#e5a43b] font-medium"
        >
          View all
        </button>
      </div>

      <div className="space-y-1">
        {tasks.slice(0, 3).map((task) => (
          <TaskItem key={task.id} task={task} showDueDate={showDueDate} />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <HiOutlineCheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{emptyMessage}</p>
          </div>
        )}

        {tasks.length > 3 && (
          <button
            onClick={() => navigate('/tasks')}
            className="w-full text-center py-2 text-xs text-gray-500 hover:text-[#FDB54A] transition-colors"
          >
            +{tasks.length - 3} more task{tasks.length - 3 !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};

export const TaskWidgets = () => {
  const { upcoming, overdue, inProgress, statistics, loading, error, refresh } = useDashboardTasks();

  if (loading) {
    return (
      <div className="lg:col-span-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-md animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 mb-2">Failed to load tasks</p>
          <button
            onClick={refresh}
            className="text-sm text-red-700 hover:underline flex items-center gap-1 mx-auto"
          >
            <HiOutlineRefresh className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineClipboardList className="w-5 h-5 text-[#FDB54A]" />
          <h2 className="text-lg font-semibold text-gray-900">Task Overview</h2>
        </div>
        <button
          onClick={refresh}
          className="text-sm text-gray-500 hover:text-[#FDB54A] flex items-center gap-1 transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TaskSection
          title="Overdue Tasks"
          icon={HiOutlineExclamationCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          tasks={overdue}
          emptyMessage="No overdue tasks!"
          showDueDate={true}
        />

        <TaskSection
          title="Upcoming (7 days)"
          icon={HiOutlineClock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          tasks={upcoming}
          emptyMessage="No upcoming tasks"
          showDueDate={true}
        />

        <TaskSection
          title="In Progress"
          icon={HiOutlineRefresh}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          tasks={inProgress}
          emptyMessage="No tasks in progress"
          showDueDate={false}
        />
      </div>

      {/* Quick Stats */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
            <p className="text-xs text-gray-500">Total Tasks</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-green-600">{statistics.completed || 0}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-blue-600">{statistics.in_progress || 0}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-2xl font-bold text-red-600">{statistics.overdue || 0}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskWidgets;
