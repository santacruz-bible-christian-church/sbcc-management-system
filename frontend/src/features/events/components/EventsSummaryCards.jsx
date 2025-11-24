import { HiCalendar, HiClipboardCheck, HiOutlineClock } from 'react-icons/hi';
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
];

export const EventsSummaryCards = ({ summary, completionRate }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {SUMMARY_CONFIG.map((card) => (
      <StatsCard
        key={card.key}
        title={card.title}
        value={card.value(summary, completionRate)}
        change={card.description(summary, completionRate)}
        icon={card.icon}
        variant={card.variant}
      />
    ))}
  </section>
);

export default EventsSummaryCards;
