import { DEFAULT_FORM_VALUES, EVENT_TYPE_OPTIONS, STATUS_METADATA } from './constants';

const buildOptionMap = (options) =>
  options.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

const EVENT_TYPE_LABEL_MAP = buildOptionMap(EVENT_TYPE_OPTIONS);

export const withAlpha = (hex, alpha = 0.15) => {
  if (!hex) return `rgba(0, 0, 0, ${alpha})`;
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDateTimeInput = (value) => {
  const date = safeDate(value);
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const formatDateTimeDisplay = (value) => {
  const date = safeDate(value);
  if (!date) return 'TBA';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

export const formatDateRange = (start, end) => {
  const startLabel = formatDateTimeDisplay(start);
  if (!end) return startLabel;
  const endLabel = formatDateTimeDisplay(end);
  return `${startLabel} - ${endLabel}`;
};

export const formatCapacity = (event) => {
  const registered = event.attendee_count ?? 0;
  if (event.max_attendees) {
    const available =
      event.available_slots ?? Math.max(0, event.max_attendees - registered);
    return `${registered}/${event.max_attendees} registered • ${available} open`;
  }
  return `${registered} registered`;
};

export const cleanFilters = (filters) =>
  Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});

export const serializeEventForm = (values) => {
  const payload = {
    title: values.title,
    description: values.description,
    event_type: values.event_type,
    status: values.status,
    location: values.location,
    is_recurring: Boolean(values.is_recurring),
  };

  // ✅ FIX: Use 'date' and 'end_date' (not start_datetime/end_datetime)
  payload.date = values.date ? new Date(values.date).toISOString() : null;
  payload.end_date = values.end_date ? new Date(values.end_date).toISOString() : null;

  // ✅ FIX: Add organizer (current user ID from context)
  // This will be added in the component

  payload.ministry = values.ministry && values.ministry !== '' ? Number(values.ministry) : null;
  payload.max_attendees =
    values.max_attendees !== '' && values.max_attendees !== null
      ? Number(values.max_attendees)
      : null;

  console.log('📤 Event payload:', payload);
  return payload;
};

export const prepareEventFormValues = (event) => {
  if (!event) {
    return { ...DEFAULT_FORM_VALUES };
  }

  return {
    ...DEFAULT_FORM_VALUES,
    ...event,
    // Map backend fields to form fields
    date: event.date || event.start_datetime || '',
    end_date: event.end_date || event.end_datetime || '',
    ministry: event.ministry ?? '',
    max_attendees:
      event.max_attendees !== null && event.max_attendees !== undefined
        ? String(event.max_attendees)
        : '',
    is_recurring: Boolean(event.is_recurring),
  };
};

export const summarizeEvents = (events) =>
  events.reduce(
    (acc, event) => {
      acc.total += 1;
      const statusKey = event.status && STATUS_METADATA[event.status] ? event.status : 'draft';
      acc.byStatus[statusKey] = (acc.byStatus[statusKey] || 0) + 1;
      acc.registered += event.attendee_count ?? 0;
      return acc;
    },
    {
      total: 0,
      byStatus: { draft: 0, published: 0, completed: 0, cancelled: 0 },
      registered: 0,
    }
  );

export const calculateCompletionRate = (summary) => {
  const baseline =
    summary.byStatus.draft + summary.byStatus.published + summary.byStatus.completed;
  if (baseline === 0) return 0;
  return Math.round((summary.byStatus.completed / baseline) * 100);
};

export const getEventTypeLabel = (value) =>
  EVENT_TYPE_LABEL_MAP[value] ?? EVENT_TYPE_LABEL_MAP.other ?? value;
