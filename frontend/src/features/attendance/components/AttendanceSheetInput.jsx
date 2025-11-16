import { useState, useEffect, useRef } from 'react';
import { X, Calendar as CalIcon, AlertCircle } from 'lucide-react';
import { eventsApi } from '../../../api/events.api';

const ACCENT = '#FDB54A';

// Minimal calendar component
function MiniCalendar({ selected, onSelect }) {
  const toDate = (d) => {
    if (!d) return null;
    if (d instanceof Date) return d;
    const parts = String(d).split('/');
    if (parts.length === 3) {
      const mm = parseInt(parts[0], 10) - 1;
      const dd = parseInt(parts[1], 10);
      const yyyy = parseInt(parts[2], 10);
      return new Date(yyyy, mm, dd);
    }
    const parsed = new Date(d);
    return isNaN(parsed) ? null : parsed;
  };

  const selectedDate = toDate(selected);
  const today = new Date();

  const [view, setView] = useState(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (selectedDate) {
      setView(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const prevMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const monthLabel = view.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - firstDayIndex + 1;
    if (i < firstDayIndex) {
      const day = daysInPrev - (firstDayIndex - 1 - i);
      const dateObj = new Date(year, month - 1, day);
      cells.push({ day, inMonth: false, date: dateObj });
    } else if (dayIndex <= daysInMonth) {
      const day = dayIndex;
      const dateObj = new Date(year, month, day);
      cells.push({ day, inMonth: true, date: dateObj });
    } else {
      const day = dayIndex - daysInMonth;
      const dateObj = new Date(year, month + 1, day);
      cells.push({ day, inMonth: false, date: dateObj });
    }
  }

  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">←</button>
        <div className="font-medium">{monthLabel}</div>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-xs text-gray-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {cells.map((c, idx) => {
          const selectedHere = selectedDate && isSameDay(c.date, selectedDate);
          const todayHere = isSameDay(c.date, today);
          return (
            <button
              key={idx}
              onClick={() => onSelect(c.date)}
              className={`py-2 rounded ${c.inMonth ? 'text-gray-800' : 'text-gray-400'} flex items-center justify-center ${selectedHere ? 'bg-[#FDB54A] text-white' : todayHere ? 'ring-1 ring-gray-200' : 'hover:bg-gray-100'}`}
            >
              <span className="text-sm">{c.day}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={() => onSelect(null)} className="px-4 py-2 rounded bg-gray-100">Clear</button>
        <button onClick={() => onSelect(today)} className="px-4 py-2 rounded" style={{ backgroundColor: ACCENT, color: 'white' }}>Today</button>
      </div>
    </div>
  );
}

export default function AttendanceSheetInput({ open = false, onClose = () => {}, onCreate = () => {} }) {
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [date, setDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const parseMMDDYYYY = (s) => {
    if (!s) return null;
    const parts = String(s).split('/');
    if (parts.length !== 3) return null;
    const mm = parseInt(parts[0], 10);
    const dd = parseInt(parts[1], 10);
    const yyyy = parseInt(parts[2], 10);

    // Validation
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > 31) return null;
    if (yyyy < 1900 || yyyy > 2100) return null;

    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? null : d;
  };

  const formatMMDDYYYY = (d) => {
    if (!d) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
  };

  const validateDate = (value) => {
    if (!value) {
      setDateError('Date is required');
      return false;
    }

    // Check format MM/DD/YYYY
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(value)) {
      setDateError('Please use MM/DD/YYYY format');
      return false;
    }

    const parsed = parseMMDDYYYY(value);
    if (!parsed) {
      setDateError('Invalid date');
      return false;
    }

    setDateError('');
    return true;
  };

  const handleDateChange = (value) => {
    setDate(value);

    // Auto-format: add slashes
    let formatted = value.replace(/\D/g, ''); // Remove non-digits
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }

    if (formatted !== value) {
      setDate(formatted);
    }

    // Validate if complete
    if (formatted.length === 10) {
      const isValid = validateDate(formatted);
      if (isValid) {
        const parsed = parseMMDDYYYY(formatted);
        setSelectedDate(parsed);
      }
    } else {
      setDateError('');
    }
  };

  // Load events on mount
  useEffect(() => {
    if (open) {
      loadEvents();
    }
  }, [open]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await eventsApi.listEvents({ pageSize: 100 });
      setEvents(data.results || data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = () => {
    // Validate event
    if (!eventId) {
      alert('Please select an event');
      return;
    }

    // Validate date
    if (!validateDate(date)) {
      return;
    }

    onCreate({ eventId: parseInt(eventId), date, selectedDate, notes });
  };

  const handleClose = () => {
    setEventId('');
    setDate('');
    setDateError('');
    setNotes('');
    setSelectedDate(null);
    onClose();
  };

  // ✅ NEW: Auto-fill date when event is selected
  const handleEventChange = (eventIdValue) => {
    setEventId(eventIdValue);

    if (eventIdValue) {
      // Find selected event
      const selectedEvent = events.find(e => e.id === parseInt(eventIdValue));

      if (selectedEvent && selectedEvent.date) {
        // Auto-fill with event's date
        const eventDate = new Date(selectedEvent.date);
        const formatted = formatMMDDYYYY(eventDate);

        setDate(formatted);
        setSelectedDate(eventDate);
        validateDate(formatted);

        console.log('📅 Auto-filled date from event:', formatted);
      }
    } else {
      // Clear date if no event selected
      setDate('');
      setSelectedDate(null);
      setDateError('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex">
          {/* Left form */}
          <div className="w-1/2 p-8">
            <div className="flex items-start justify-start">
              <h2 className="text-3xl font-bold text-gray-900">
                Create New
                <br />
                Attendance Sheet
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              {/* Event Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event <span className="text-red-500">*</span>
                </label>
                <select
                  value={eventId}
                  onChange={(e) => handleEventChange(e.target.value)} // ← Use new handler
                  className="w-full px-4 py-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#FDB54A] focus:outline-none transition-all"
                  style={{ border: '1px solid #e5e7eb' }}
                  disabled={loadingEvents}
                >
                  <option value="">Select an event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {loadingEvents && (
                  <p className="text-xs text-gray-500 mt-1">Loading events...</p>
                )}
              </div>

              {/* Date - REDESIGNED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  💡 Auto-filled from event. Change if recording attendance on a different day.
                </p>
                <div className="relative">
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white shadow-sm transition-all ${
                      dateError
                        ? 'ring-2 ring-red-500'
                        : 'focus-within:ring-2 focus-within:ring-[#FDB54A]'
                    }`}
                    style={{ border: dateError ? 'none' : '1px solid #e5e7eb' }}
                  >
                    <CalIcon className="w-5 h-5 text-[#FDB54A] flex-shrink-0" />
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      onBlur={() => date && validateDate(date)}
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      style={{ border: 'none' }}
                    />
                    {dateError && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  {dateError && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <span>•</span> {dateError}
                    </p>
                  )}
                  {selectedDate && !dateError && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span> {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-[#FDB54A] focus:outline-none transition-all resize-none"
                  style={{ border: '1px solid #e5e7eb' }}
                  rows={3}
                  placeholder="Add any notes about this attendance sheet..."
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!eventId || !date || dateError}
                  className="w-44 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: ACCENT }}
                >
                  Create Sheet
                </button>
              </div>
            </div>
          </div>

          {/* Right calendar pane */}
          <div className="w-1/2 p-8 bg-gray-50 flex items-center justify-center relative">
            <button
              onClick={handleClose}
              aria-label="Close modal"
              title="Close"
              className="absolute top-4 right-6 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-full max-w-sm">
              <MiniCalendar
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  const formatted = d ? formatMMDDYYYY(d) : '';
                  setDate(formatted);
                  if (formatted) {
                    validateDate(formatted);
                  } else {
                    setDateError('');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
