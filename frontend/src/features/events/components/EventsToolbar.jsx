import { HiOutlineCalendar, HiOutlineFilter, HiOutlinePlusCircle, HiOutlineRefresh, HiViewList } from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { EventsSummaryCards } from './EventsSummaryCards';

/**
 * EventsToolbar - Unified toolbar for events page
 * Contains view toggle, filters, refresh, and create button
 */
export function EventsToolbar({
  showCalendar,
  onToggleView,
  filtersOpen,
  onToggleFilters,
  onRefresh,
  onCreateClick,
  canManage,
  isLoading,
  summary,
}) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex-wrap">
      {/* Left: Stats (Board View only) or empty space */}
      <div className="flex items-center">
        {!showCalendar && <EventsSummaryCards summary={summary} />}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Board View specific actions */}
        {!showCalendar && (
          <>
            <SecondaryButton
              icon={HiOutlineRefresh}
              onClick={onRefresh}
              disabled={isLoading}
            >
              Refresh
            </SecondaryButton>
            <SecondaryButton
              icon={HiOutlineFilter}
              onClick={onToggleFilters}
              className={filtersOpen ? 'bg-sbcc-light-orange/60' : undefined}
            >
              {filtersOpen ? 'Hide Filters' : 'Filter'}
            </SecondaryButton>
            {canManage && (
              <PrimaryButton
                icon={HiOutlinePlusCircle}
                onClick={onCreateClick}
                disabled={isLoading}
              >
                New Event
              </PrimaryButton>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />
          </>
        )}

        {/* View Toggle - Always visible */}
        <SecondaryButton
          icon={showCalendar ? HiViewList : HiOutlineCalendar}
          onClick={onToggleView}
        >
          {showCalendar ? 'Board View' : 'Calendar'}
        </SecondaryButton>
      </div>
    </div>
  );
}

export default EventsToolbar;
