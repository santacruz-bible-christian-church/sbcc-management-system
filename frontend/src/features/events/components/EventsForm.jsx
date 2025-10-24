import { useEffect, useState } from 'react';
import { EVENT_TYPE_OPTIONS, STATUS_OPTIONS, DEFAULT_FORM_VALUES } from '../utils/constants';
import { formatDateTimeInput, serializeEventForm } from '../utils/formats';

const fieldClass =
  'events-input focus:outline-none focus:ring-0 w-full text-sbcc-dark placeholder:text-sbcc-gray';

const labelClass =
  'events-field-label text-xs font-semibold uppercase tracking-wide text-sbcc-dark/70';

const groupClass = 'grid gap-4 md:grid-cols-2';

export const EventsForm = ({
  initialValues = DEFAULT_FORM_VALUES,
  submitting = false,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
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
    onSubmit(serializeEventForm(values));
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className={`${groupClass} md:grid-cols-2`}>
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="event-title">
            Title
          </label>
          <input
            id="event-title"
            name="title"
            className={fieldClass}
            value={values.title}
            onChange={handleChange}
            placeholder="Event title"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="event-type">
            Event Type
          </label>
          <select
            id="event-type"
            name="event_type"
            className={fieldClass}
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
          <label className={labelClass} htmlFor="event-status">
            Status
          </label>
          <select
            id="event-status"
            name="status"
            className={fieldClass}
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

        <div>
          <label className={labelClass} htmlFor="event-date">
            Start Date &amp; Time
          </label>
          <input
            id="event-date"
            name="date"
            type="datetime-local"
            className={fieldClass}
            value={formatDateTimeInput(values.date)}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="event-end">
            End Date &amp; Time
          </label>
          <input
            id="event-end"
            name="end_date"
            type="datetime-local"
            className={fieldClass}
            value={formatDateTimeInput(values.end_date)}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="event-location">
            Location
          </label>
          <input
            id="event-location"
            name="location"
            className={fieldClass}
            value={values.location}
            onChange={handleChange}
            placeholder="e.g. Main Sanctuary"
            required
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="event-ministry">
            Ministry ID
          </label>
          <input
            id="event-ministry"
            name="ministry"
            className={fieldClass}
            value={values.ministry}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="event-capacity">
            Capacity
          </label>
          <input
            id="event-capacity"
            name="max_attendees"
            type="number"
            min="0"
            className={fieldClass}
            value={values.max_attendees}
            onChange={handleChange}
            placeholder="Leave blank for unlimited"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="event-description">
            Description
          </label>
          <textarea
            id="event-description"
            name="description"
            className={`${fieldClass} h-32`}
            value={values.description}
            onChange={handleChange}
            placeholder="Share details, agenda, or speaker information"
          />
        </div>

        <label className="flex items-center gap-3 md:col-span-2 text-sm text-sbcc-dark">
          <input
            id="event-recurring"
            name="is_recurring"
            type="checkbox"
            className="h-4 w-4 accent-sbcc-primary"
            checked={values.is_recurring}
            onChange={handleChange}
          />
          This is a recurring event
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          className="rounded-full px-4 py-2 text-sbcc-dark hover:bg-sbcc-light-orange/60 transition"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-sbcc-gradient px-6 py-2 font-semibold text-white shadow-[0_16px_32px_rgba(253,181,74,0.32)] hover:shadow-[0_22px_48px_rgba(253,181,74,0.4)] transition disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventsForm;
