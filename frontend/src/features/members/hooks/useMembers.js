import { useCallback, useEffect, useState } from 'react';
import { membersApi } from '../../../api/members.api';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    ministry: '',
    status: '',
  });
  const [search, setSearch] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        search: search || undefined,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await membersApi.listMembers(params);
      const results = Array.isArray(data) ? data : data.results ?? [];
      setMembers(results);
    } catch (err) {
      setMembers([]);
      setError(err.response?.data?.detail || 'Unable to load members');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = async (data) => {
    setLoading(true);
    try {
      await membersApi.createMember(data);
      await fetchMembers();
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
      await fetchMembers();
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
      await fetchMembers();
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
    setFilters,
    setSearch,
    resetFilters,
    refresh: fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  };
};
