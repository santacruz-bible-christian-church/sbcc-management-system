import { SBCC_COLORS } from '../../../store/theme.store';

export const PRAYER_CATEGORY_OPTIONS = [
  { value: 'health', label: 'Health & Healing' },
  { value: 'family', label: 'Family' },
  { value: 'financial', label: 'Financial' },
  { value: 'spiritual', label: 'Spiritual Growth' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'work', label: 'Work/Career' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'guidance', label: 'Guidance & Wisdom' },
  { value: 'other', label: 'Other' },
];

export const PRAYER_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const PRAYER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'prayed', label: 'Prayed For' },
  { value: 'follow_up', label: 'Needs Follow-up' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export const FOLLOW_UP_ACTION_OPTIONS = [
  { value: 'prayed', label: 'Prayed For' },
  { value: 'called', label: 'Phone Call Made' },
  { value: 'visited', label: 'Home Visit' },
  { value: 'counseling', label: 'Counseling Session' },
  { value: 'email', label: 'Email Sent' },
  { value: 'text', label: 'Text Message Sent' },
  { value: 'meeting', label: 'Meeting Held' },
  { value: 'note', label: 'Note Added' },
  { value: 'other', label: 'Other' },
];

export const PRIORITY_METADATA = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '📝'
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '📌'
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: '⚠️'
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '🚨'
  },
};

export const STATUS_METADATA = {
  pending: {
    label: 'Pending',
    tint: SBCC_COLORS.text.gray,
    icon: '⏳'
  },
  assigned: {
    label: 'Assigned',
    tint: SBCC_COLORS.info,
    icon: '👤'
  },
  in_progress: {
    label: 'In Progress',
    tint: SBCC_COLORS.warning,
    icon: '⚙️'
  },
  prayed: {
    label: 'Prayed For',
    tint: SBCC_COLORS.secondary,
    icon: '🙏'
  },
  follow_up: {
    label: 'Needs Follow-up',
    tint: SBCC_COLORS.warning,
    icon: '🔔'
  },
  completed: {
    label: 'Completed',
    tint: SBCC_COLORS.success,
    icon: '✅'
  },
  archived: {
    label: 'Archived',
    tint: SBCC_COLORS.text.gray,
    icon: '📦'
  },
};

export const DEFAULT_FORM_VALUES = {
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  is_anonymous: false,
  is_private: false,
  is_public: false,
  requester_name: '',
  requester_email: '',
  requester_phone: '',
};

export const SUMMARY_CARDS = [
  { key: 'all', icon: '📋', title: 'All Requests', filterValue: 'all' },
  { key: 'pending', icon: '⏳', title: 'Pending', filterValue: 'pending' },
  { key: 'in_progress', icon: '🙏', title: 'In Prayer', filterValue: 'in_progress' },
  { key: 'completed', icon: '✅', title: 'Completed', filterValue: 'completed' },
];
