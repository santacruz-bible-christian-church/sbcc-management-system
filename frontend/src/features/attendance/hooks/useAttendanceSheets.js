import { useCallback, useEffect, useState } from 'react';
import { attendanceApi } from '../../../api/attendance.api';

export const useAttendanceSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    event: '',
    date: '',
  });
  const [search, setSearch] = useState('');

  const fetchSheets = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        search: search || undefined,
        page,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await attendanceApi.listSheets(params);

      // Handle paginated response
      if (data.results) {
        setSheets(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
          totalPages: Math.ceil(data.count / 10),
        });
      } else {
        // Fallback for non-paginated response
        setSheets(Array.isArray(data) ? data : []);
        setPagination({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          currentPage: 1,
          totalPages: 1,
        });
      }
    } catch (err) {
      setSheets([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
      });
      setError(err.response?.data?.detail || 'Unable to load attendance sheets');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    fetchSheets(1);
  }, [filters, search]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchSheets(page);
  }, [fetchSheets, pagination.totalPages]);

  const createSheet = async (data) => {
    setLoading(true);
    try {
      await attendanceApi.createSheet(data);
      await fetchSheets(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create attendance sheet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSheet = async (id, data) => {
    setLoading(true);
    try {
      await attendanceApi.updateSheet(id, data);
      await fetchSheets(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update attendance sheet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSheet = async (id) => {
    setLoading(true);
    try {
      await attendanceApi.deleteSheet(id);
      // If current page becomes empty after delete, go to previous page
      if (sheets.length === 1 && pagination.currentPage > 1) {
        await fetchSheets(pagination.currentPage - 1);
      } else {
        await fetchSheets(pagination.currentPage);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete attendance sheet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadSheet = async (id) => {
    try {
      const blob = await attendanceApi.downloadSheet(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_sheet_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to download attendance sheet');
      throw err;
    }
  };

  const resetFilters = () => {
    setFilters({ event: '', date: '' });
    setSearch('');
  };

  return {
    sheets,
    loading,
    error,
    filters,
    search,
    pagination,
    setFilters,
    setSearch,
    resetFilters,
    goToPage,
    refresh: fetchSheets,
    createSheet,
    updateSheet,
    deleteSheet,
    downloadSheet,
  };
};
