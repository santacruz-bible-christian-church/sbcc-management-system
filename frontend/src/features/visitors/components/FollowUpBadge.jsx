import { HiClock, HiRefresh, HiStar } from 'react-icons/hi';
import { FOLLOW_UP_COLORS } from '../utils/constants';

const ICONS = {
  visited_1x: HiClock,
  visited_2x: HiRefresh,
  regular: HiStar,
};

export function FollowUpBadge({ status }) {
  const colors = FOLLOW_UP_COLORS[status] || FOLLOW_UP_COLORS.visited_1x;
  const Icon = ICONS[status] || HiClock;

  const labels = {
    visited_1x: 'Visited 1x',
    visited_2x: 'Visited 2x',
    regular: 'Regular',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <Icon className="w-3 h-3" />
      <span>{labels[status] || status}</span>
    </span>
  );
}

export default FollowUpBadge;
