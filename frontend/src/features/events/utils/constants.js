import { SBCC_COLORS } from '../../../store/theme.store';
import {
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiRefresh,
} from 'react-icons/hi';

export const EVENT_TYPE_OPTIONS = [
  { value: 'service', label: 'Sunday Service' },
  { value: 'bible_study', label: 'Bible Study' },
  { value: 'prayer_meeting', label: 'Prayer Meeting' },
  { value: 'fellowship', label: 'Fellowship' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'other', label: 'Other' },
];


export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const DEFAULT_FILTERS = {
  event_type: '',
  status: '',
  ministry: '',
  start_date: '',
  end_date: '',
};

export const DEFAULT_ORDERING = '-date';

export const DEFAULT_FORM_VALUES = {
  title: '',
  description: '',
  event_type: 'service',
  status: 'draft',
  date: '',
  end_date: '',
  location: '',
  ministry: '',
  max_attendees: '',
  is_recurring: false,
  recurrence_pattern: 'none',
  recurrence_end_date: '',
};

export const STATUS_METADATA = {
  draft: { label: 'Draft', tint: SBCC_COLORS.info, text: SBCC_COLORS.info },
  published: {
    label: 'Published',
    tint: SBCC_COLORS.primary,
    text: SBCC_COLORS.text.dark,
  },
  completed: { label: 'Completed', tint: SBCC_COLORS.success, text: SBCC_COLORS.success },
  cancelled: { label: 'Cancelled', tint: SBCC_COLORS.danger, text: SBCC_COLORS.danger },
};

export const EVENT_TYPE_METADATA = {
  service: { tint: SBCC_COLORS.primary },
  bible_study: { tint: SBCC_COLORS.info },
  prayer_meeting: { tint: SBCC_COLORS.secondary },
  fellowship: { tint: SBCC_COLORS.warning },
  outreach: { tint: SBCC_COLORS.secondary },
  other: { tint: SBCC_COLORS.text.gray },
};

export const SUMMARY_CARDS = [
  { key: 'all', icon: HiClipboardList, title: 'All Requests', filterValue: 'all' },
  { key: 'pending', icon: HiClock, title: 'Pending', filterValue: 'pending' },
  { key: 'in_progress', icon: HiRefresh, title: 'In Prayer', filterValue: 'in_progress' },
  { key: 'completed', icon: HiCheckCircle, title: 'Completed', filterValue: 'completed' },
];
