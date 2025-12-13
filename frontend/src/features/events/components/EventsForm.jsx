import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { HiCalendar, HiClock, HiLocationMarker, HiUserGroup, HiTag, HiDocumentText } from 'react-icons/hi';
import { EVENT_TYPE_OPTIONS, STATUS_OPTIONS, DEFAULT_FORM_VALUES } from '../utils/constants';

// Helper to parse datetime-local value into separate date and time
const parseDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return { date: '', time: '' };
  try {
    const dt = new Date(dateTimeStr);
    if (isNaN(dt.getTime())) return { date: '', time: '' };
    return {
      date: format(dt, 'yyyy-MM-dd'),
      time: format(dt, 'HH:mm'),
    };
  } catch {
    return { date: '', time: '' };
  }
};

// Helper to combine date and time into ISO string
const combineDateTime = (dateStr, timeStr) => {
  if (!dateStr) return '';
  const time = timeStr || '00:00';
  return new Date(`${dateStr}T${time}:00`).toISOString();
};

const inputClass = `
  w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
  text-sm text-gray-800 placeholder-gray-400
  focus:outline-none focus:bg-white focus:border-sbcc-orange focus:ring-2 focus:ring-orange-100
  transition-all
`;

const selectClass = `
  w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl
  text-sm text-gray-800 appearance-none cursor-pointer
  focus:outline-none focus:bg-white focus:border-sbcc-orange focus:ring-2 focus:ring-orange-100
  transition-all
`;

const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <Icon className="w-4 h-4 text-sbcc-orange" />
    <h3 className="text-sm font-bold text-gray-700">{children}</h3>
  </div>
);

export const EventsForm = ({
  initialValues = DEFAULT_FORM_VALUES,
  submitting = false,
  onSubmit,
  onCancel,
}) => {
  // Parse initial date/time values
  const startParsed = parseDateTime(initialValues.date || initialValues.start_date);
  const endParsed = parseDateTime(initialValues.end_date);

  const [values, setValues] = useState({
    ...initialValues,
    startDate: startParsed.date,
    startTime: startParsed.time || '09:00',
    endDate: endParsed.date,
    endTime: endParsed.time || '10:00',
  });

  useEffect(() => {
    const startParsed = parseDateTime(initialValues.date || initialValues.start_date);
    const endParsed = parseDateTime(initialValues.end_date);
    setValues({
      ...initialValues,
      startDate: startParsed.date,
      startTime: startParsed.time || '09:00',
      endDate: endParsed.date,
      endTime: endParsed.time || '10:00',
    });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Payload must match backend Event model fields
    const payload = {
      title: values.title,
      description: values.description,
      event_type: values.event_type,
      status: values.status,
      date: combineDateTime(values.startDate, values.startTime), // Backend uses 'date' not 'start_date'
      end_date: values.endDate ? combineDateTime(values.endDate, values.endTime) : null,
      location: values.location,
      ministry: values.ministry || null,
      max_attendees: values.max_attendees ? parseInt(values.max_attendees) : null, // Backend uses 'max_attendees'
      is_recurring: values.is_recurring,
    };

    onSubmit(payload);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Basic Info Section */}
      <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
        <SectionTitle icon={HiTag}>Basic Information</SectionTitle>

        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="event-title">Event Title *</label>
            <input
              id="event-title"
              name="title"
              className={inputClass}
              value={values.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-type">Event Type *</label>
              <select
                id="event-type"
                name="event_type"
                className={selectClass}
                value={values.event_type}
                onChange={handleChange}
                required
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="event-status">Status *</label>
              <select
                id="event-status"
                name="status"
                className={selectClass}
                value={values.status}
                onChange={handleChange}
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
        <SectionTitle icon={HiCalendar}>Date & Time</SectionTitle>

        <div className="space-y-4">
          {/* Start Date/Time */}
          <div>
            <label className={labelClass}>Start *</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="startDate"
                  type="date"
                  className={`${inputClass} pl-10`}
                  value={values.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative">
                <HiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="startTime"
                  type="time"
                  className={`${inputClass} pl-10`}
                  value={values.startTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* End Date/Time */}
          <div>
            <label className={labelClass}>End (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="endDate"
                  type="date"
                  className={`${inputClass} pl-10`}
                  value={values.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <HiClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="endTime"
                  type="time"
                  className={`${inputClass} pl-10`}
                  value={values.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Details Section */}
      <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
        <SectionTitle icon={HiLocationMarker}>Location & Details</SectionTitle>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="event-location">Location *</label>
              <input
                id="event-location"
                name="location"
                className={inputClass}
                value={values.location}
                onChange={handleChange}
                placeholder="e.g. Main Sanctuary"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="event-capacity">Capacity</label>
              <div className="relative">
                <HiUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="event-capacity"
                  name="max_attendees"
                  type="number"
                  min="0"
                  className={`${inputClass} pl-10`}
                  value={values.max_attendees}
                  onChange={handleChange}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              name="description"
              rows={4}
              className={`${inputClass} resize-none`}
              value={values.description}
              onChange={handleChange}
              placeholder="Share details, agenda, or speaker information..."
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
            <input
              name="is_recurring"
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-sbcc-orange focus:ring-sbcc-orange"
              checked={values.is_recurring}
              onChange={handleChange}
            />
            <span>This is a recurring event</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-400 to-sbcc-orange rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventsForm;
