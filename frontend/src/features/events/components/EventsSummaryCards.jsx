import { HiCalendar, HiPencil, HiCheck, HiCheckCircle, HiBan } from 'react-icons/hi';

export const EventsSummaryCards = ({ summary }) => {
  const stats = [
    { key: 'total', label: 'Total', value: summary.total, icon: HiCalendar, color: 'text-gray-700' },
    { key: 'draft', label: 'Draft', value: summary.byStatus.draft || 0, icon: HiPencil, color: 'text-gray-500' },
    { key: 'published', label: 'Published', value: summary.byStatus.published || 0, icon: HiCheck, color: 'text-emerald-600' },
    { key: 'completed', label: 'Completed', value: summary.byStatus.completed || 0, icon: HiCheckCircle, color: 'text-blue-600' },
    { key: 'cancelled', label: 'Cancelled', value: summary.byStatus.cancelled || 0, icon: HiBan, color: 'text-red-500' },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stats.map((stat, index) => (
        <div key={stat.key} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-300">•</span>}
          <stat.icon className={`w-4 h-4 mr-1.5 ${stat.color}`} />
          <span className="text-sm font-medium text-gray-900">{stat.value}</span>
          <span className="text-sm text-gray-500 ml-1">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

export default EventsSummaryCards;
