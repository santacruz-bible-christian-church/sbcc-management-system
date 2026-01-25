import { useState } from 'react';
import clsx from 'clsx';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiCalendar,
  HiClock,
  HiLocationMarker,
  HiRefresh,
} from 'react-icons/hi';
import { useCalendar } from '../hooks/useCalendar';

// Status-based colors (matches backend status options)
const getStatusColor = (status) => {
  switch(status) {
    case 'draft': return 'bg-gray-400';
    case 'published': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

const getStatusBorderColor = (status) => {
  switch(status) {
    case 'draft': return '#9ca3af';
    case 'published': return '#3b82f6';
    case 'completed': return '#22c55e';
    case 'cancelled': return '#ef4444';
    default: return '#3b82f6';
  }
};

const getStatusBgColor = (status) => {
  switch(status) {
    case 'draft': return '#f3f4f6';
    case 'published': return '#eff6ff';
    case 'completed': return '#f0fdf4';
    case 'cancelled': return '#fef2f2';
    default: return '#eff6ff';
  }
};

const getStatusTextColor = (status) => {
  switch(status) {
    case 'draft': return '#4b5563';
    case 'published': return '#1d4ed8';
    case 'completed': return '#15803d';
    case 'cancelled': return '#dc2626';
    default: return '#1d4ed8';
  }
};

export const EventsCalendar = ({ events, onEventClick }) => {
  const [viewMode, setViewMode] = useState('month');

  const {
    currentDate,
    days,
    daysOfWeek,
    goToPrevious,
    goToNext,
    goToDate,
    setView,
  } = useCalendar(events);

  // Sync view mode with hook
  const handleViewChange = (mode) => {
    setViewMode(mode);
    setView(mode);
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date || event.date);
      return isSameDay(eventDate, date);
    });
  };

  // Click on a day to switch to day view
  const handleDayClick = (day) => {
    goToDate(day.date);
    setViewMode('day');
    setView('day');
  };

  // Week view: Get days of current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Day view: Events for current date
  const todayEvents = getEventsForDay(currentDate);

  const renderMonthView = () => (
    <div className="grid grid-cols-7">
      {days.map((day, index) => (
        <div
          key={day.dateKey}
          onClick={() => handleDayClick(day)}
          className={clsx(
            'min-h-[100px] p-1.5 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
            (index + 1) % 7 === 0 && 'border-r-0',
            index >= days.length - 7 && 'border-b-0'
          )}
        >
          {/* Day Number */}
          <div className="flex justify-between items-start mb-1">
            <span className={clsx(
              'text-xs inline-flex items-center justify-center',
              day.isToday
                ? 'w-6 h-6 rounded-full bg-sbcc-orange text-white font-semibold'
                : day.inCurrentMonth
                  ? 'text-gray-700 font-medium'
                  : 'text-gray-300'
            )}>
              {format(day.date, 'd')}
            </span>
            {day.events.length > 2 && (
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1 rounded">
                +{day.events.length - 2}
              </span>
            )}
          </div>

          {/* Event Pills - Readable labels */}
          {day.events.length > 0 && (
            <div className="space-y-0.5">
              {day.events.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(event); }}
                  className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: getStatusBgColor(event.status),
                    color: getStatusTextColor(event.status),
                    borderLeft: `2px solid ${getStatusBorderColor(event.status)}`,
                  }}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 min-h-[300px]">
      {weekDays.map((day, index) => {
        const dayEvents = getEventsForDay(day);
        const isToday = isSameDay(day, new Date());
        return (
          <div
            key={day.toISOString()}
            onClick={() => { goToDate(day); setViewMode('day'); setView('day'); }}
            className={clsx(
              'p-2 border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
              index === 6 && 'border-r-0'
            )}
          >
            <div className={clsx(
              'text-xs font-medium mb-2 text-center',
              isToday ? 'text-sbcc-orange' : 'text-gray-500'
            )}>
              <span className={clsx(
                'inline-flex items-center justify-center w-6 h-6 rounded-full',
                isToday && 'bg-sbcc-orange text-white'
              )}>
                {format(day, 'd')}
              </span>
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 4).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(event); }}
                  className={`text-[10px] px-1.5 py-1 rounded truncate text-white cursor-pointer hover:opacity-80 ${getStatusColor(event.status)}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 4 && (
                <span className="text-[9px] text-gray-400">+{dayEvents.length - 4} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => (
    <div className="min-h-[300px] p-4">
      <div className="text-center mb-4">
        <span className={clsx(
          'inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold',
          isSameDay(currentDate, new Date())
            ? 'bg-sbcc-orange text-white'
            : 'bg-gray-100 text-gray-700'
        )}>
          {format(currentDate, 'd')}
        </span>
        <p className="text-sm text-gray-500 mt-1">{format(currentDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {todayEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No events scheduled for this day</p>
          <button
            onClick={() => { setViewMode('month'); setView('month'); }}
            className="mt-4 text-sm text-sbcc-orange hover:underline"
          >
            ← Back to Month View
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todayEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onEventClick && onEventClick(event)}
              className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderLeftWidth: '4px', borderLeftColor: getStatusBorderColor(event.status) }}
            >
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{event.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <HiClock className="w-3.5 h-3.5" />
                  {format(new Date(event.start_date || event.date), 'h:mm a')}
                  {event.end_date && ` - ${format(new Date(event.end_date), 'h:mm a')}`}
                  {event.is_recurring && (
                    <HiRefresh className="ml-2 w-3.5 h-3.5 text-gray-400" title="Recurring Event" />
                  )}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <HiLocationMarker className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={() => { setViewMode('month'); setView('month'); }}
            className="mt-4 text-sm text-sbcc-orange hover:underline block mx-auto"
          >
            ← Back to Month View
          </button>
        </div>
      )}
    </div>
  );

  // Get display label based on view mode
  const getHeaderLabel = () => {
    switch(viewMode) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left: Calendar Icon */}
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <HiCalendar className="w-4 h-4 text-sbcc-orange" />
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              className="p-1.5 text-gray-400 hover:text-sbcc-orange hover:bg-orange-50 rounded transition-colors"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-sbcc-orange min-w-[160px] text-center">
              {getHeaderLabel()}
            </span>
            <button
              type="button"
              onClick={goToNext}
              className="p-1.5 text-gray-400 hover:text-sbcc-orange hover:bg-orange-50 rounded transition-colors"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: View Tabs */}
          <div className="flex text-xs gap-1 bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewChange(mode)}
                className={clsx(
                  'px-3 py-1 rounded-md capitalize transition-all',
                  viewMode === mode
                    ? 'bg-white text-sbcc-orange font-semibold shadow-sm'
                    : 'text-gray-500 hover:text-sbcc-orange'
                )}
              >
                {mode === 'month' ? 'Month' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Days of Week Header (only for month/week view) */}
      {viewMode !== 'day' && (
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {daysOfWeek.map((label) => (
            <div key={label} className="py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default EventsCalendar;
