import { useState, useCallback, useEffect } from 'react';
import { settingsApi } from '../../../api/settings.api';

/**
 * Hook for managing team members CRUD operations
 */
export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getTeamMembers();
      setTeamMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setError(err.response?.data?.detail || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const createTeamMember = useCallback(async (data) => {
    setSaving(true);
    setError(null);
    try {
      const created = await settingsApi.createTeamMember(data);
      setTeamMembers(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error('Failed to create team member:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateTeamMember = useCallback(async (id, data) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await settingsApi.updateTeamMember(id, data);
      setTeamMembers(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      console.error('Failed to update team member:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteTeamMember = useCallback(async (id) => {
    setSaving(true);
    setError(null);
    try {
      await settingsApi.deleteTeamMember(id);
      setTeamMembers(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete team member:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    teamMembers,
    loading,
    saving,
    error,
    refetch: fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
};

export default useTeamMembers;
