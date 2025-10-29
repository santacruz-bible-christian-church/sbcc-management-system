import {
  addDays,
  addMonths,
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

  const eventsByDate = useMemo(
    () =>
      events.reduce((acc, event) => {
        if (!event.date) return acc;
        const key = format(new Date(event.date), 'yyyy-MM-dd');
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
      }, {}),
    [events]
  );

  const goToPrevious = () => setCurrentDate((date) => subMonths(date, 1));
  const goToNext = () => setCurrentDate((date) => addMonths(date, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

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

  const daysOfWeek = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) =>
        format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), index), 'EEE')
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
  };
};

export default useCalendar;
