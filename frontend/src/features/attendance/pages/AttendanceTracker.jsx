import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import {
  AttendanceFilterBar,
  AttendanceMemberList,
  AttendanceTrackerHeader,
  AttendanceBulkActionsBar,
} from '../components';
import { useAttendanceTracker } from '../hooks/useAttendanceTracker';
import { useAttendanceFilters } from '../hooks/useAttendanceFilters';
import { useMultiSelect } from '../hooks/useMultiSelect';

export default function AttendanceTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const attendanceId = location.state?.attendanceId;

  // Main data hook
  const {
    sheet,
    attendanceRecords,
    setAttendanceRecords,
    loading,
    saving,
    error,
    successMessage,
    hasChanges,
    setHasChanges,
    handleToggleAttendance,
    handleSaveChanges,
  } = useAttendanceTracker(attendanceId);

  // Filter and pagination hook
  const {
    query,
    ministryFilter,
    page,
    pageSize,
    ministries,
    filtered,
    pageCount,
    pageItems,
    setPage,
    handleQueryChange,
    handleMinistryChange,
    handleClearFilters,
    resetFilters,
  } = useAttendanceFilters(attendanceRecords);

  // Multi-select hook
  const {
    selectedRecords,
    isMultiSelectMode,
    isAllPageSelected,
    isSomePageSelected,
    toggleMultiSelectMode,
    toggleRecordSelection,
    toggleAllPageSelection,
    handleBulkMarkPresent,
    handleBulkMarkAbsent,
    handleBulkToggle,
    clearSelection,
    resetMultiSelect,
  } = useMultiSelect({
    attendanceRecords,
    setAttendanceRecords,
    setHasChanges,
    pageItems,
  });

  // Save handler with reset callback
  const onSave = useCallback(() => {
    handleSaveChanges(() => {
      resetFilters();
      resetMultiSelect();
    });
  }, [handleSaveChanges, resetFilters, resetMultiSelect]);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="xl" />
            <p className="mt-3 text-gray-500">Loading attendance tracker...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state (no sheet loaded)
  if (error && !sheet) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/attendance')}
              className="mt-4 text-[#FDB54A] hover:underline"
            >
              ← Back to Attendance Sheets
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          {/* Back navigation */}
          <Link
            to="/attendance"
            className="inline-flex items-center text-sm text-[#FDB54A] font-medium hover:underline mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Attendance Sheets
          </Link>

          {/* Event info + Stats */}
          <AttendanceTrackerHeader
            sheet={sheet}
            isMultiSelectMode={isMultiSelectMode}
            onToggleMultiSelectMode={toggleMultiSelectMode}
          />

          {/* Bulk Actions Bar */}
          {isMultiSelectMode && (
            <AttendanceBulkActionsBar
              selectedCount={selectedRecords.size}
              onMarkPresent={handleBulkMarkPresent}
              onMarkAbsent={handleBulkMarkAbsent}
              onToggle={handleBulkToggle}
              onClear={clearSelection}
            />
          )}

          {/* Controls row */}
          <div className="mt-4">
            <AttendanceFilterBar
              query={query}
              onQueryChange={handleQueryChange}
              ministryFilter={ministryFilter}
              onMinistryChange={handleMinistryChange}
              ministries={ministries}
              onClearFilters={handleClearFilters}
              onSave={onSave}
              hasChanges={hasChanges}
              saving={saving}
            />
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3" role="alert">
              <p className="text-green-800 text-sm">✓ {successMessage}</p>
            </div>
          )}

          {/* Error message for save failures */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Unsaved changes warning */}
          {hasChanges && !successMessage && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3" role="alert">
              <p className="text-yellow-800 text-sm">
                You have unsaved changes. Click &quot;Save Changes&quot; to update the attendance records.
              </p>
            </div>
          )}
        </div>

        {/* Member List with saving overlay */}
        <div className={`relative ${saving ? 'opacity-60 pointer-events-none' : ''}`}>
          {saving && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
                <p className="text-sm font-medium text-gray-700">Saving changes...</p>
              </div>
            </div>
          )}
          <AttendanceMemberList
            members={pageItems}
            page={page}
            pageCount={pageCount}
            totalCount={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onToggleAttendance={handleToggleAttendance}
            saving={saving}
            isMultiSelectMode={isMultiSelectMode}
            selectedRecords={selectedRecords}
            onToggleSelection={toggleRecordSelection}
            isAllPageSelected={isAllPageSelected}
            isSomePageSelected={isSomePageSelected}
            onToggleAllPage={toggleAllPageSelection}
          />
        </div>
      </div>
    </main>
  );
}
