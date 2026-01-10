import { useState, useCallback, useMemo } from 'react';

const PAGE_SIZE = 8;

/**
 * Hook for managing attendance filter and pagination state
 */
export const useAttendanceFilters = (attendanceRecords) => {
  const [query, setQuery] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');
  const [page, setPage] = useState(1);

  // Get unique ministries from records
  const ministries = useMemo(() => {
    const ministrySet = new Set();
    attendanceRecords.forEach((record) => {
      if (record.member_ministry) {
        ministrySet.add(record.member_ministry);
      }
    });
    return Array.from(ministrySet).sort();
  }, [attendanceRecords]);

  // Filter records
  const filtered = useMemo(() => {
    return attendanceRecords.filter((record) => {
      // Ministry filter
      if (ministryFilter && record.member_ministry !== ministryFilter) return false;

      // Search filter
      if (query) {
        const searchLower = query.toLowerCase();
        const memberName = record.member_name?.toLowerCase() || '';
        if (!memberName.includes(searchLower)) return false;
      }

      return true;
    });
  }, [query, ministryFilter, attendanceRecords]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handle query change with page reset
  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setPage(1);
  }, []);

  // Handle ministry change with page reset
  const handleMinistryChange = useCallback((value) => {
    setMinistryFilter(value);
    setPage(1);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setMinistryFilter('');
    setQuery('');
    setPage(1);
  }, []);

  // Reset filters (for after save)
  const resetFilters = useCallback(() => {
    setMinistryFilter('');
    setQuery('');
    setPage(1);
  }, []);

  return {
    query,
    ministryFilter,
    page,
    pageSize: PAGE_SIZE,
    ministries,
    filtered,
    pageCount,
    pageItems,
    setPage,
    handleQueryChange,
    handleMinistryChange,
    handleClearFilters,
    resetFilters,
  };
};

export default useAttendanceFilters;
