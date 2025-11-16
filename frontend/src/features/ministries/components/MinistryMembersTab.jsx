import { useState, useEffect } from 'react';
import { HiUserAdd, HiPencil, HiTrash, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton, Button } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import AddVolunteerModal from './AddVolunteerModal';
import EditVolunteerModal from './EditVolunteerModal';

const ROLE_LABELS = {
  volunteer: 'Volunteer',
  lead: 'Lead',
  usher: 'Usher',
  worship: 'Worship',
};

export const MinistryMembersTab = ({ ministry, onRefresh }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalState, setEditModalState] = useState({ open: false, member: null });
  const [deleteModalState, setDeleteModalState] = useState({ open: false, member: null });
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING MINISTRY MEMBERS ===');
      console.log('Ministry ID:', ministry.id);

      const data = await ministriesApi.listMembers({ ministry: ministry.id });
      console.log('Raw response:', data);

      const membersList = Array.isArray(data) ? data : data.results || [];
      console.log('Processed members list:', membersList);

      setMembers(membersList);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
      console.error('Error response:', err.response?.data);
      showError('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ministry?.id) {
      fetchMembers();
    }
  }, [ministry?.id]);

  const handleAddSuccess = async () => {
    setAddModalOpen(false);
    await fetchMembers();
    // Refresh parent to update stats
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleEditSuccess = async () => {
    setEditModalState({ open: false, member: null });
    await fetchMembers();
    // Refresh parent to update stats
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteModalState.member) return;

    try {
      await ministriesApi.deleteMember(deleteModalState.member.id);
      showSuccess('Volunteer removed from ministry');
      setDeleteModalState({ open: false, member: null });
      await fetchMembers();
      // Refresh parent to update stats
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError('Failed to remove volunteer');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sbcc-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Volunteer Roster</h3>
            <p className="text-sm text-gray-600 mt-1">
              {members.length} {members.length === 1 ? 'volunteer' : 'volunteers'} serving in this ministry
            </p>
          </div>
          <PrimaryButton icon={HiUserAdd} onClick={() => setAddModalOpen(true)}>
            Add Volunteer
          </PrimaryButton>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <HiUserAdd className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a volunteer to this ministry.</p>
            <div className="mt-6">
              <PrimaryButton onClick={() => setAddModalOpen(true)}>
                Add First Volunteer
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Available Days</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Max Consecutive Shifts</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {members.map((member) => {
                  // Extract user data safely
                  const userName = member.user
                    ? `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || member.user.username || member.user.email
                    : 'Unknown User';

                  const userEmail = member.user?.email || 'No email';

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="font-medium text-gray-900">{userName}</div>
                        <div className="text-gray-500">{userEmail}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {member.is_active ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <HiCheckCircle className="h-5 w-5" />
                            <span className="text-xs font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-700">
                            <HiXCircle className="h-5 w-5" />
                            <span className="text-xs font-medium">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {Array.isArray(member.available_days) && member.available_days.length > 0
                          ? member.available_days.join(', ')
                          : 'Any day'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        {member.max_consecutive_shifts || 'Unlimited'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium space-x-2">
                        <SecondaryButton
                          size="sm"
                          icon={HiPencil}
                          onClick={() => setEditModalState({ open: true, member })}
                        >
                          Edit
                        </SecondaryButton>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={HiTrash}
                          onClick={() => setDeleteModalState({ open: true, member })}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Volunteer Modal */}
        <AddVolunteerModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          ministry={ministry}
          onSuccess={handleAddSuccess}
        />

        {/* Edit Volunteer Modal */}
        <EditVolunteerModal
          open={editModalState.open}
          onClose={() => setEditModalState({ open: false, member: null })}
          member={editModalState.member}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Confirmation */}
        <ConfirmationModal
          open={deleteModalState.open}
          title="Remove Volunteer?"
          message={`Are you sure you want to remove this volunteer from ${ministry.name}? They will no longer be assigned to shifts.`}
          confirmText="Remove"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalState({ open: false, member: null })}
        />
      </div>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </>
  );
};

export default MinistryMembersTab;
