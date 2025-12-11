import { HiOutlineCake, HiOutlineHeart } from 'react-icons/hi';
import { format, differenceInDays } from 'date-fns';

export const MemberCelebrationCard = ({ date, type, label }) => {
  if (!date) return null;

  const today = new Date();
  const celebrationDate = new Date(date);

  // Set celebration to this year
  celebrationDate.setFullYear(today.getFullYear());

  // If the date has passed this year, set to next year
  if (celebrationDate < today) {
    celebrationDate.setFullYear(today.getFullYear() + 1);
  }

  const daysUntil = differenceInDays(celebrationDate, today);

  // Only show if within 30 days
  if (daysUntil > 30) return null;

  const isToday = daysUntil === 0;
  const isSoon = daysUntil <= 7;

  const containerClass = isToday
    ? 'bg-amber-100 border border-amber-200'
    : isSoon
    ? 'bg-amber-50'
    : 'bg-gray-50';

  const iconContainerClass = type === 'birthday' ? 'bg-pink-100' : 'bg-purple-100';
  const Icon = type === 'birthday' ? HiOutlineCake : HiOutlineHeart;
  const iconClass = type === 'birthday' ? 'text-pink-600' : 'text-purple-600';

  const countdownClass = isToday
    ? 'text-amber-700'
    : isSoon
    ? 'text-amber-600'
    : 'text-gray-500';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${containerClass}`}>
      <div className={`p-2 rounded-lg ${iconContainerClass}`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">
          {format(celebrationDate, 'MMMM d')}
        </p>
      </div>
      <div className={`text-right ${countdownClass}`}>
        <p className="text-sm font-bold">
          {isToday ? '🎉 Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
};

export default MemberCelebrationCard;
