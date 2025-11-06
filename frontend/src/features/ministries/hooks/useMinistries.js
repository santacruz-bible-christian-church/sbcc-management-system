import { useCallback, useEffect, useState } from 'react';
import { ministriesApi } from '../../../api/ministries.api';

export const useMinistries = () => {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');

  const fetchMinistries = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: search || undefined,
        page,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await ministriesApi.listMinistries(params);

      // Handle paginated response
      if (data.results) {
        setMinistries(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
          totalPages: Math.ceil(data.count / 10),
        });
      } else {
        // Fallback for non-paginated response
        setMinistries(Array.isArray(data) ? data : []);
        setPagination({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          currentPage: 1,
          totalPages: 1,
        });
      }
    } catch (err) {
      setMinistries([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
      });
      setError(err.response?.data?.detail || 'Unable to load ministries');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchMinistries(1);
  }, [search]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchMinistries(page);
  }, [fetchMinistries, pagination.totalPages]);

  const createMinistry = async (data) => {
    setLoading(true);
    try {
      await ministriesApi.createMinistry(data);
      await fetchMinistries(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create ministry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMinistry = async (id, data) => {
    setLoading(true);
    try {
      await ministriesApi.updateMinistry(id, data);
      await fetchMinistries(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update ministry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMinistry = async (id) => {
    setLoading(true);
    try {
      await ministriesApi.deleteMinistry(id);
      // If current page becomes empty after delete, go to previous page
      if (ministries.length === 1 && pagination.currentPage > 1) {
        await fetchMinistries(pagination.currentPage - 1);
      } else {
        await fetchMinistries(pagination.currentPage);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete ministry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rotateShifts = async (id, rotateData) => {
    setLoading(true);
    try {
      const result = await ministriesApi.rotateShifts(id, rotateData);
      await fetchMinistries(pagination.currentPage);
      return result;
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to rotate shifts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    ministries,
    loading,
    error,
    search,
    pagination,
    setSearch,
    goToPage,
    refresh: fetchMinistries,
    createMinistry,
    updateMinistry,
    deleteMinistry,
    rotateShifts,
  };
};
