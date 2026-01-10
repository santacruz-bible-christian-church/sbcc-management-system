import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for managing multi-select state and bulk actions
 */
export const useMultiSelect = ({ attendanceRecords, setAttendanceRecords, setHasChanges, pageItems }) => {
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Multi-select helpers
  const isAllPageSelected = useMemo(() =>
    pageItems.length > 0 && pageItems.every(r => selectedRecords.has(r.id)),
    [pageItems, selectedRecords]
  );

  const isSomePageSelected = useMemo(() =>
    pageItems.some(r => selectedRecords.has(r.id)) && !isAllPageSelected,
    [pageItems, selectedRecords, isAllPageSelected]
  );

  // Toggle multi-select mode
  const toggleMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode((prev) => !prev);
    setSelectedRecords(new Set());
  }, []);

  // Select/deselect individual record
  const toggleRecordSelection = useCallback((recordId) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  }, []);

  // Select/deselect all on current page
  const toggleAllPageSelection = useCallback(() => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);

      if (isAllPageSelected) {
        pageItems.forEach(record => newSet.delete(record.id));
      } else {
        pageItems.forEach(record => newSet.add(record.id));
      }

      return newSet;
    });
  }, [pageItems, isAllPageSelected]);

  // Bulk mark present
  const handleBulkMarkPresent = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: true } : record
      )
    );
    setHasChanges(true);
    setSelectedRecords(new Set());
  }, [selectedRecords, setAttendanceRecords, setHasChanges]);

  // Bulk mark absent
  const handleBulkMarkAbsent = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: false } : record
      )
    );
    setHasChanges(true);
    setSelectedRecords(new Set());
  }, [selectedRecords, setAttendanceRecords, setHasChanges]);

  // Bulk toggle
  const handleBulkToggle = useCallback(() => {
    if (selectedRecords.size === 0) return;

    setAttendanceRecords((prev) =>
      prev.map((record) =>
        selectedRecords.has(record.id) ? { ...record, attended: !record.attended } : record
      )
    );
    setHasChanges(true);
    setSelectedRecords(new Set());
  }, [selectedRecords, setAttendanceRecords, setHasChanges]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRecords(new Set());
  }, []);

  // Reset all multi-select state
  const resetMultiSelect = useCallback(() => {
    setSelectedRecords(new Set());
    setIsMultiSelectMode(false);
  }, []);

  return {
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
  };
};

export default useMultiSelect;
