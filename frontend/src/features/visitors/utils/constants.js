// Status choices for visitors
export const VISITOR_STATUS = {
  VISITOR: 'visitor',
  MEMBER: 'member',
};

export const VISITOR_STATUS_OPTIONS = [
  { value: 'visitor', label: 'Visitor' },
  { value: 'member', label: 'Member' },
];

// Follow-up status choices
export const FOLLOW_UP_STATUS = {
  VISITED_1X: 'visited_1x',
  VISITED_2X: 'visited_2x',
  REGULAR: 'regular',
};

export const FOLLOW_UP_STATUS_OPTIONS = [
  { value: 'visited_1x', label: 'Visited 1x' },
  { value: 'visited_2x', label: 'Visited 2x' },
  { value: 'regular', label: 'Regular Visitor' },
];

// Color schemes for status badges
export const STATUS_COLORS = {
  visitor: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  member: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
};

export const FOLLOW_UP_COLORS = {
  visited_1x: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  visited_2x: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  regular: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
};

// Default filter state
export const DEFAULT_FILTERS = {
  search: '',
  status: '',
  follow_up_status: '',
  page: 1,
  page_size: 10,
};
