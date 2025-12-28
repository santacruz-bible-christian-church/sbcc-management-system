import { HiClock, HiCheckCircle, HiChartBar } from 'react-icons/hi';
import { CgSpinner } from 'react-icons/cg'; // Using CgSpinner for "In Progress" to match the dots/spinner look better if possible, or stick to HiLightningBolt but styled differently. Let's stick to standard icons but maybe HiDotsHorizontal or similar. Actually the reference has a spinner-like icon.

export const TaskStatisticsCards = ({ statistics }) => {
  if (!statistics) return null;

  const totalTasks = statistics.total || 0;
  const completedTasks = statistics.by_status?.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const cards = [
    {
      title: 'Pending Tasks',
      value: statistics.by_status?.pending || 0,
      icon: HiClock,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      title: 'In Progress',
      value: statistics.by_status?.in_progress || 0,
      icon: CgSpinner, // Or HiLightningBolt
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: HiCheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: HiChartBar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5"
        >
          <div className={`p-4 rounded-xl ${card.iconBg} ${card.iconColor}`}>
            <card.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
