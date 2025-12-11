import { useState, useCallback } from 'react';
import { ministriesApi } from '../../../api/ministries.api';

export const useLeaderValidation = () => {
  const [existingLeader, setExistingLeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkExistingLeader = useCallback(async (ministryId, excludeMemberId = null) => {
    if (!ministryId) {
      setExistingLeader(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ministriesApi.listMembers({ ministry: ministryId });
      const membersList = Array.isArray(data) ? data : data.results || [];

      // Find existing lead, optionally excluding a specific member (for edits)
      const currentLead = membersList.find(
        m => m.role === 'lead' && (!excludeMemberId || m.id !== excludeMemberId)
      );

      setExistingLeader(currentLead || null);
      return currentLead || null;
    } catch (err) {
      console.error('Failed to check existing leader:', err);
      setError(err.response?.data?.detail || 'Failed to validate leader');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const canAssignLead = useCallback((selectedRole) => {
    return selectedRole !== 'lead' || !existingLeader;
  }, [existingLeader]);

  const getLeaderName = useCallback(() => {
    if (!existingLeader || !existingLeader.member) return 'Another volunteer';

    const { first_name, last_name, full_name } = existingLeader.member;
    return `${first_name || ''} ${last_name || ''}`.trim() || full_name || 'Another volunteer';
  }, [existingLeader]);

  return {
    existingLeader,
    loading,
    error,
    checkExistingLeader,
    canAssignLead,
    getLeaderName
  };
};
