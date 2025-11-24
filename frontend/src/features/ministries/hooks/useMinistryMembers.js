import { useState, useEffect, useCallback } from 'react';
import { ministriesApi } from '../../../api/ministries.api';

export const useMinistryMembers = (ministryId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!ministryId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== FETCHING MINISTRY MEMBERS ===');
      console.log('Ministry ID:', ministryId);

      const data = await ministriesApi.listMembers({ ministry: ministryId });
      console.log('Raw response:', data);

      const membersList = Array.isArray(data) ? data : data.results || [];
      console.log('Processed members list:', membersList);

      setMembers(membersList);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (memberData) => {
    await ministriesApi.createMember(memberData);
    await fetchMembers();
  }, [fetchMembers]);

  const updateMember = useCallback(async (memberId, memberData) => {
    await ministriesApi.updateMember(memberId, memberData);
    await fetchMembers();
  }, [fetchMembers]);

  const deleteMember = useCallback(async (memberId) => {
    await ministriesApi.deleteMember(memberId);
    await fetchMembers();
  }, [fetchMembers]);

  const checkExistingLeader = useCallback(() => {
    return members.find(m => m.role === 'lead') || null;
  }, [members]);

  return {
    members,
    loading,
    error,
    refresh: fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    checkExistingLeader
  };
};
