import { useState, useEffect, useCallback } from 'react';
import {
  getVisitors,
  getVisitorById,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  checkInVisitor,
  convertVisitorToMember,
  updateFollowUpStatus,
  getVisitorStatistics,
} from '../../../api/visitors.api';
import { DEFAULT_FILTERS } from '../utils/constants';

export function useVisitors(initialFilters = {}) {
  const [visitors, setVisitors] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    totalPages: 1,
  });

  // Fetch visitors list
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.follow_up_status) params.follow_up_status = filters.follow_up_status;
      params.page = filters.page;
      params.page_size = filters.page_size;

      const response = await getVisitors(params);

      // Handle paginated response
      if (response.results) {
        setVisitors(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
          totalPages: Math.ceil(response.count / filters.page_size),
        });
      } else {
        // Non-paginated response
        setVisitors(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(err.response?.data?.detail || 'Failed to load visitors');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const stats = await getVisitorStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // CRUD operations
  const handleCreate = async (data) => {
    const newVisitor = await createVisitor(data);
    await fetchVisitors();
    await fetchStatistics();
    return newVisitor;
  };

  const handleUpdate = async (id, data) => {
    const updated = await updateVisitor(id, data);
    await fetchVisitors();
    return updated;
  };

  const handleDelete = async (id) => {
    await deleteVisitor(id);
    await fetchVisitors();
    await fetchStatistics();
  };

  // Custom actions
  const handleCheckIn = async (id, serviceDate) => {
    const result = await checkInVisitor(id, serviceDate);
    await fetchVisitors();
    await fetchStatistics();
    return result;
  };

  const handleConvertToMember = async (id, data) => {
    const result = await convertVisitorToMember(id, data);
    await fetchVisitors();
    await fetchStatistics();
    return result;
  };

  const handleUpdateFollowUp = async (id, status) => {
    const result = await updateFollowUpStatus(id, status);
    await fetchVisitors();
    await fetchStatistics();
    return result;
  };

  // Filter handlers
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const goToPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Refresh
  const refresh = () => {
    fetchVisitors();
    fetchStatistics();
  };

  return {
    // Data
    visitors,
    statistics,
    pagination,

    // State
    loading,
    statsLoading,
    error,
    filters,

    // CRUD
    createVisitor: handleCreate,
    updateVisitor: handleUpdate,
    deleteVisitor: handleDelete,

    // Custom actions
    checkIn: handleCheckIn,
    convertToMember: handleConvertToMember,
    updateFollowUp: handleUpdateFollowUp,

    // Filters
    setFilters: updateFilters,
    resetFilters,
    goToPage,

    // Utils
    refresh,
  };
}

export default useVisitors;
