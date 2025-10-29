import clsx from 'clsx';
import { format } from 'date-fns';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { useCalendar } from '../hooks/useCalendar';
import { STATUS_METADATA } from '../utils/constants';
import { withAlpha } from '../utils/format';

const viewOptions = [
  { value: 'month', label: 'Month' },
  { value: 'agenda', label: 'Agenda' },
];

const badgeStyle = (status) => {
  const meta = STATUS_METADATA[status] ?? STATUS_METADATA.draft;
  return {
    backgroundColor: withAlpha(meta.tint, 0.14),
    color: meta.text,
  };
};

const AgendaList = ({ days }) => (
  <div className="space-y-4">
    {days
      .filter((day) => day.events.length > 0)
      .map((day) => (
        <section key={day.dateKey} className="rounded-xl bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-sbcc-gray uppercase tracking-wide">
                {format(day.date, 'EEEE')}
              </p>
              <h3 className="text-lg font-bold text-sbcc-dark">{format(day.date, 'MMMM d')}</h3>
            </div>
            {day.isToday && (
              <span className="rounded-full bg-sbcc-primary/10 px-3 py-1 text-sm font-semibold text-sbcc-primary">
                Today
              </span>
            )}
          </header>
          <div className="space-y-3">
            {day.events.map((event) => (
              <article key={event.id} className="rounded-lg border border-sbcc-primary/10 p-3">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-sbcc-dark">{event.title}</h4>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    style={badgeStyle(event.status)}
                  >
                    {STATUS_METADATA[event.status]?.label ?? STATUS_METADATA.draft.label}
                  </span>
                </header>
                <dl className="mt-2 space-y-1 text-sm text-sbcc-gray">
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-sbcc-dark">Time</dt>
                    <dd>{format(new Date(event.date), 'p')}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="font-medium text-sbcc-dark">Location</dt>
                    <dd>{event.location || 'TBD'}</dd>
                  </div>
                </dl>
                {event.description && (
                  <p className="mt-2 text-sm text-sbcc-gray/90">{event.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
  </div>
);

export const EventsCalendar = ({ events }) => {
  const {
    currentDate,
    view,
    setView,
    days,
    daysOfWeek,
    goToPrevious,
    goToNext,
    goToToday,
  } = useCalendar(events);

  return (
    <section className="calendar-shell">
      <header className="calendar-header">
        <div>
          <p className="calendar-header__label">Calendar</p>
          <h2 className="calendar-header__title">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="calendar-header__actions">
          <div className="calendar-view-toggle">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={view === option.value ? 'active' : ''}
                onClick={() => setView(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="calendar-nav">
            <button type="button" onClick={goToPrevious} aria-label="Previous month">
              <HiOutlineChevronLeft />
            </button>
            <button type="button" onClick={goToToday}>
              Today
            </button>
            <button type="button" onClick={goToNext} aria-label="Next month">
              <HiOutlineChevronRight />
            </button>
          </div>
        </div>
      </header>

      {view === 'agenda' ? (
        <AgendaList days={days} />
      ) : (
        <div className="calendar-grid">
          {daysOfWeek.map((label) => (
            <div key={label} className="calendar-grid__weekday">
              {label}
            </div>
          ))}

          {days.map((day) => (
            <article
              key={day.dateKey}
              className={clsx('calendar-grid__cell', {
                'calendar-grid__cell--outside': !day.inCurrentMonth,
                'calendar-grid__cell--today': day.isToday,
              })}
            >
              <header className="calendar-grid__cell-header">
                <span>{format(day.date, 'd')}</span>
                {day.isToday && <span className="calendar-grid__today-dot" />}
              </header>

              {day.events.length > 0 && (
                <ol className="calendar-grid__events">
                  {day.events.slice(0, 3).map((event) => (
                    <li key={event.id} style={badgeStyle(event.status)}>
                      <span>{event.title}</span>
                    </li>
                  ))}
                  {day.events.length > 3 && (
                    <li className="calendar-grid__events-more">
                      +{day.events.length - 3} more
                    </li>
                  )}
                </ol>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventsCalendar;
