import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useMemo, useState } from 'react';

const DEFAULT_VIEW = 'month';

export const useCalendar = (events) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(DEFAULT_VIEW);

  // Group events by date - use start_date (not date)
  const eventsByDate = useMemo(
    () =>
      events.reduce((acc, event) => {
        // Support both 'date' and 'start_date' fields
        const eventDate = event.start_date || event.date;
        if (!eventDate) return acc;
        const key = format(new Date(eventDate), 'yyyy-MM-dd');
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
      }, {}),
    [events]
  );

  // Navigation functions based on current view
  const goToPrevious = () => {
    switch(view) {
      case 'day':
        setCurrentDate((date) => subDays(date, 1));
        break;
      case 'week':
        setCurrentDate((date) => subWeeks(date, 1));
        break;
      case 'month':
      default:
        setCurrentDate((date) => subMonths(date, 1));
        break;
    }
  };

  const goToNext = () => {
    switch(view) {
      case 'day':
        setCurrentDate((date) => addDays(date, 1));
        break;
      case 'week':
        setCurrentDate((date) => addWeeks(date, 1));
        break;
      case 'month':
      default:
        setCurrentDate((date) => addMonths(date, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const goToDate = (date) => setCurrentDate(date);

  // Generate calendar days for month view
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = [];
    let day = rangeStart;

    while (day <= rangeEnd) {
      const key = format(day, 'yyyy-MM-dd');
      calendarDays.push({
        date: day,
        dateKey: key,
        isToday: isToday(day),
        inCurrentMonth: isSameMonth(day, currentDate),
        events: eventsByDate[key] ?? [],
      });
      day = addDays(day, 1);
    }

    return calendarDays;
  }, [currentDate, eventsByDate]);

  // Days of week labels (Sunday start)
  const daysOfWeek = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) =>
        format(addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), index), 'EEE')
      ),
    []
  );

  return {
    currentDate,
    view,
    setView,
    days,
    daysOfWeek,
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,
  };
};

export default useCalendar;
