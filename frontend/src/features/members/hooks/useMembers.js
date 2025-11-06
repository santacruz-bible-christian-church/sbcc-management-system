import { useCallback, useEffect, useState } from 'react';
import { membersApi } from '../../../api/members.api';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
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
    gender: '',
    ministry: '',
    status: '',
  });
  const [search, setSearch] = useState('');

  const fetchMembers = useCallback(async (page = 1) => {
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
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await membersApi.listMembers(params);

      // Handle paginated response
      if (data.results) {
        setMembers(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
          currentPage: page,
          totalPages: Math.ceil(data.count / 10), // Backend PAGE_SIZE is 10
        });
      } else {
        // Fallback for non-paginated response
        setMembers(Array.isArray(data) ? data : []);
        setPagination({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          currentPage: 1,
          totalPages: 1,
        });
      }
    } catch (err) {
      setMembers([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1,
      });
      setError(err.response?.data?.detail || 'Unable to load members');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    fetchMembers(1); // Always start from page 1 when filters/search change
  }, [filters, search]);

  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchMembers(page);
  }, [fetchMembers, pagination.totalPages]);

  const createMember = async (data) => {
    setLoading(true);
    try {
      await membersApi.createMember(data);
      await fetchMembers(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to create member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (id, data) => {
    setLoading(true);
    try {
      await membersApi.updateMember(id, data);
      await fetchMembers(pagination.currentPage);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id) => {
    setLoading(true);
    try {
      await membersApi.deleteMember(id);
      // If current page becomes empty after delete, go to previous page
      if (members.length === 1 && pagination.currentPage > 1) {
        await fetchMembers(pagination.currentPage - 1);
      } else {
        await fetchMembers(pagination.currentPage);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ gender: '', ministry: '', status: '' });
    setSearch('');
  };

  return {
    members,
    loading,
    error,
    filters,
    search,
    pagination,
    setFilters,
    setSearch,
    resetFilters,
    refresh: fetchMembers,
    goToPage,
    createMember,
    updateMember,
    deleteMember,
  };
};
