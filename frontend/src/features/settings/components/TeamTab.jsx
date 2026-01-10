import { useState } from 'react';
import { HiPlus, HiPencil, HiTrash, HiUserGroup } from 'react-icons/hi';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { TeamMemberModal } from './TeamMemberModal';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';

const ROLE_COLORS = {
  pastor: 'bg-purple-100 text-purple-800',
  elder: 'bg-blue-100 text-blue-800',
  deacon: 'bg-green-100 text-green-800',
  staff: 'bg-gray-100 text-gray-700',
};

export const TeamTab = ({ onSuccess, onError }) => {
  const {
    teamMembers,
    loading,
    saving,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  } = useTeamMembers();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleAdd = () => {
    setSelectedMember(null);
    setModalOpen(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedMember) {
        await updateTeamMember(selectedMember.id, data);
        onSuccess?.('Team member updated successfully');
      } else {
        await createTeamMember(data);
        onSuccess?.('Team member added successfully');
      }
      setModalOpen(false);
    } catch (err) {
      onError?.(err.response?.data?.detail || 'Failed to save team member');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    try {
      await deleteTeamMember(memberToDelete.id);
      onSuccess?.('Team member deleted successfully');
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      onError?.(err.response?.data?.detail || 'Failed to delete team member');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500">
            Manage church leadership displayed on the public website
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
        >
          <HiPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Team Members List */}
      {teamMembers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <HiUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-4">Add your church leadership to display on the public site</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            <HiPlus size={16} />
            Add First Member
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 ${
                  !member.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Photo */}
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                    {!member.is_active && (
                      <span className="text-xs text-gray-400">(Inactive)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{member.title}</p>
                </div>

                {/* Role Badge */}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}`}>
                  {member.role_display || member.role}
                </span>

                {/* Order */}
                <span className="text-xs text-gray-400 w-8 text-center">
                  #{member.order}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <HiPencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(member)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Team members with lower order numbers appear first on the public site.
          Only active members are displayed publicly.
        </p>
      </div>

      {/* Add/Edit Modal */}
      <TeamMemberModal
        isOpen={modalOpen}
        member={selectedMember}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        open={deleteModalOpen}
        title="Delete Team Member?"
        message={`Are you sure you want to delete "${memberToDelete?.name}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
      />
    </div>
  );
};

export default TeamTab;
