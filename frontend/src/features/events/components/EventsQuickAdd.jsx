import { useState } from 'react';
import { format } from 'date-fns';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineLocationMarker, HiCheck, HiPlus } from 'react-icons/hi';
import { STATUS_OPTIONS, EVENT_TYPE_OPTIONS } from '../utils/constants';

const EventsQuickAdd = ({ onCreate, submitting }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('service');
  const [status, setStatus] = useState('published');
  const [isExpanded, setIsExpanded] = useState(false);

  // Status color mapping
  const statusColors = {
    draft: { bg: 'bg-gray-400', label: 'Draft' },
    published: { bg: 'bg-blue-500', label: 'Published' },
    completed: { bg: 'bg-green-500', label: 'Completed' },
    cancelled: { bg: 'bg-red-500', label: 'Cancelled' },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date) return;

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Payload must match backend Event model fields
    const payload = {
      title,
      description: '',
      event_type: eventType,
      status: status,
      date: startDateTime.toISOString(), // Backend uses 'date' not 'start_date'
      end_date: endDateTime.toISOString(),
      location: location || 'Main Hall',
      max_attendees: null, // Backend uses 'max_attendees' not 'capacity'
      is_recurring: false,
    };

    onCreate(payload);
    // Reset form
    setTitle('');
    setLocation('');
    setIsExpanded(false);
  };

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:bg-white focus:border-sbcc-orange focus:ring-1 focus:ring-sbcc-orange transition-all cursor-text";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-bold text-sbcc-orange flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Quick Add Event
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-400 hover:text-sbcc-orange transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Row 1: Title */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Event Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Sunday Service, Bible Study..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* Row 2: Date & Time */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Date *
            </label>
            <div className="relative">
              <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Start Time
            </label>
            <div className="relative">
              <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              End Time
            </label>
            <div className="relative">
              <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        {/* Expanded options */}
        {isExpanded && (
          <>
            {/* Row 3: Location & Event Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Location
                </label>
                <div className="relative">
                  <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Main Hall"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={inputClass}
                  style={{ cursor: 'pointer' }}
                >
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Row 4: Status & Submit */}
        <div className="flex items-end justify-between gap-4 pt-2">
          {/* Status Selection - Now with labels */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex gap-1.5">
              {Object.entries(statusColors).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                    status === key
                      ? `${value.bg} text-white border-transparent shadow-sm`
                      : `bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === key ? 'bg-white/80' : value.bg}`} />
                  {value.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !title || !date}
            className="px-8 py-2.5 bg-gradient-to-r from-orange-400 to-sbcc-orange text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventsQuickAdd;
