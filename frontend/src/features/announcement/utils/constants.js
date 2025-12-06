import {
  HiSpeakerphone,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiUsers,
  HiUserGroup,
  HiCalendar,
  HiMail,
  HiEye
} from 'react-icons/hi';
import { SBCC_COLORS } from '../../../store/theme.store';

// Backend audience choices
export const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Members', icon: HiUsers },
  { value: 'ministry', label: 'Specific Ministry', icon: HiUserGroup },
];

// Status indicators
export const ANNOUNCEMENT_STATUS = {
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  EXPIRED: 'expired',
};

export const getAnnouncementStatus = (announcement) => {
  const now = new Date();
  const publishAt = new Date(announcement.publish_at);
  const expireAt = announcement.expire_at ? new Date(announcement.expire_at) : null;

  if (!announcement.is_active) return ANNOUNCEMENT_STATUS.EXPIRED;
  if (publishAt > now) return ANNOUNCEMENT_STATUS.SCHEDULED;
  if (expireAt && expireAt < now) return ANNOUNCEMENT_STATUS.EXPIRED;
  return ANNOUNCEMENT_STATUS.PUBLISHED;
};

export const STATUS_CONFIG = {
  [ANNOUNCEMENT_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: SBCC_COLORS.info,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: HiClock,
  },
  [ANNOUNCEMENT_STATUS.PUBLISHED]: {
    label: 'Published',
    color: SBCC_COLORS.success,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: HiCheckCircle,
  },
  [ANNOUNCEMENT_STATUS.EXPIRED]: {
    label: 'Expired',
    color: SBCC_COLORS.text.gray,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: HiXCircle,
  },
};

// Stats cards configuration
export const STATS_CARDS = [
  {
    id: 'all',
    label: 'Total',
    icon: HiSpeakerphone,
    color: SBCC_COLORS.primary,
    filterFn: () => true,
  },
  {
    id: 'published',
    label: 'Published',
    icon: HiCheckCircle,
    color: SBCC_COLORS.success,
    filterFn: (a) => getAnnouncementStatus(a) === ANNOUNCEMENT_STATUS.PUBLISHED,
  },
  {
    id: 'scheduled',
    label: 'Scheduled',
    icon: HiClock,
    color: SBCC_COLORS.info,
    filterFn: (a) => getAnnouncementStatus(a) === ANNOUNCEMENT_STATUS.SCHEDULED,
  },
  {
    id: 'sent',
    label: 'Sent',
    icon: HiMail,
    color: SBCC_COLORS.secondary,
    filterFn: (a) => a.sent,
  },
];
