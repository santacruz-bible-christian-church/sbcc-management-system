import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { ministriesApi } from '../../../api/ministries.api';

export const MinistryMembersTab = ({ ministryId, canManage, onRefresh }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ministriesApi.listMembers({ ministry: ministryId });
      setMembers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const getRoleBadgeColor = (role) => {
    const colors = {
      lead: 'bg-purple-100 text-purple-800',
      volunteer: 'bg-blue-100 text-blue-800',
      usher: 'bg-green-100 text-green-800',
      worship: 'bg-pink-100 text-pink-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-3 text-[#A0A0A0]">Loading members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] font-bold text-[#383838]">
          Ministry Members ({members.length})
        </h3>
        {canManage && (
          <button
            className="flex items-center gap-2 bg-[#FDB54A] hover:bg-[#e5a43b] text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => {/* TODO: Add member modal */}}
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[#A0A0A0]">No members in this ministry</p>
          {canManage && (
            <button
              className="mt-4 text-[#FDB54A] hover:underline"
              onClick={() => {/* TODO: Add member modal */}}
            >
              Add your first member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[16px] font-semibold text-[#383838]">
                    {member.user.full_name || member.user.username}
                  </p>
                  <span className={`text-[12px] px-3 py-1 rounded-full capitalize ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                  {!member.is_active && (
                    <span className="text-[12px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#A0A0A0]">{member.user.email}</p>
                <div className="flex gap-4 mt-2 text-[12px] text-[#A0A0A0]">
                  <span>Max Consecutive: {member.max_consecutive_shifts}</span>
                  {member.available_days && member.available_days.length > 0 && (
                    <span>Available: {member.available_days.join(', ')}</span>
                  )}
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit Member"
                    onClick={() => {/* TODO: Edit member */}}
                  >
                    <HiOutlinePencil className="w-4 h-4 text-[#FFB039]" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Remove Member"
                    onClick={() => {/* TODO: Remove member */}}
                  >
                    <HiOutlineTrash className="w-4 h-4 text-[#E55050]" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinistryMembersTab;
