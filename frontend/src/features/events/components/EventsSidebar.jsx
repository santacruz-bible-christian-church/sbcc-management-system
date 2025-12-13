import { useState } from 'react';
import { format, isValid } from 'date-fns';
import { HiSearch, HiCalendar } from 'react-icons/hi';

// Status-based colors (matches backend and calendar)
const getStatusTitleColor = (status) => {
  switch(status) {
    case 'draft': return 'text-gray-600';
    case 'published': return 'text-blue-600';
    case 'completed': return 'text-green-600';
    case 'cancelled': return 'text-red-600';
    default: return 'text-gray-800';
  }
};

const getStatusDot = (status) => {
  switch(status) {
    case 'draft': return 'bg-gray-400';
    case 'published': return 'bg-blue-500';
    case 'completed': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-blue-500';
  }
};

// Helper to get event date (handles both 'start_date' and 'date' fields)
const getEventDate = (event) => {
  const dateStr = event.start_date || event.date;
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isValid(date) ? date : null;
};

const EventsSidebar = ({
  events = [],
  search,
  onSearchChange,
  onSearchSubmit,
  onEventClick,
  onViewAll
}) => {
  const [localSearch, setLocalSearch] = useState(search || '');

  const handleChange = (e) => {
    setLocalSearch(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(e);
  };

  // Filter and sort ALL events (not just upcoming), apply search filter
  const filteredEvents = events
    .filter(e => {
      // Make sure event has valid date
      const eventDate = getEventDate(e);
      if (!eventDate) return false;

      // Apply search filter
      const matchesSearch = !localSearch ||
        e.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
        e.location?.toLowerCase().includes(localSearch.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = getEventDate(a);
      const dateB = getEventDate(b);
      return dateA - dateB; // Sort by date ascending (upcoming first)
    })
    .slice(0, 10); // Show top 10

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-sbcc-orange">Events</h2>
        <span className="text-xs text-gray-400">{events.length} total</span>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <HiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search events..."
              value={localSearch}
              onChange={handleChange}
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-sbcc-orange focus:ring-1 focus:ring-sbcc-orange"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-sbcc-orange text-white text-xs font-semibold rounded-md hover:bg-orange-500 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-center">
            <HiCalendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-xs">
              {localSearch ? 'No events match your search.' : 'No events found.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredEvents.map((event) => {
              const eventDate = getEventDate(event);
              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick && onEventClick(event)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Status Dot */}
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getStatusDot(event.status)}`} />

                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate ${getStatusTitleColor(event.status)}`}>
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        <span>{eventDate ? format(eventDate, 'MMM d, yyyy') : 'No date'}</span>
                        <span>•</span>
                        <span>{eventDate ? format(eventDate, 'h:mm a') : ''}</span>
                      </div>
                      {event.location && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View All Button */}
      {onViewAll && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={onViewAll}
            className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-sbcc-orange transition-colors"
          >
            View All Events →
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsSidebar;
