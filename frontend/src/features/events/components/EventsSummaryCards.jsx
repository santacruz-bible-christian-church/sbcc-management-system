import { HiCalendar, HiClipboardCheck, HiOutlineClock, HiUserGroup } from 'react-icons/hi';
import { StatsCard } from '../../../components/ui/Card';

const SUMMARY_CONFIG = [
  {
    key: 'total',
    title: 'Total Events',
    description: (summary) => `${summary.byStatus.published} published`,
    icon: HiCalendar,
    variant: 'orange',
    value: (summary) => summary.total,
  },
  {
    key: 'draft',
    title: 'In Draft',
    description: () => 'Awaiting publication',
    icon: HiOutlineClock,
    variant: 'blue',
    value: (summary) => summary.byStatus.draft,
  },
  {
    key: 'completed',
    title: 'Completed',
    description: (summary, completionRate) => `${completionRate}% completion`,
    icon: HiClipboardCheck,
    variant: 'green',
    value: (summary) => summary.byStatus.completed,
  },
  {
    key: 'attendance',
    title: 'Attendance',
    description: (summary) => `${summary.attended}/${summary.registered || 0} attended`,
    icon: HiUserGroup,
    variant: 'purple',
    value: (_, __, attendanceRate) => `${attendanceRate}%`,
  },
];

export const EventsSummaryCards = ({ summary, completionRate, attendanceRate }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {SUMMARY_CONFIG.map((card) => (
      <StatsCard
        key={card.key}
        title={card.title}
        value={card.value(summary, completionRate, attendanceRate)}
        change={card.description(summary, completionRate, attendanceRate)}
        icon={card.icon}
        variant={card.variant}
      />
    ))}
  </section>
);

export default EventsSummaryCards;
