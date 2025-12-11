import { useState } from 'react';
import { HiUserAdd, HiPencil, HiTrash, HiCheckCircle, HiXCircle, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useMinistryMembers } from '../hooks/useMinistryMembers';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, IconButton } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import AddVolunteerModal from './AddVolunteerModal';
import EditVolunteerModal from './EditVolunteerModal';

const ROLE_LABELS = {
  volunteer: 'Volunteer',
  lead: 'Lead',
};

const ROLE_COLORS = {
  volunteer: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  lead: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  usher: 'bg-green-50 text-green-700 ring-green-700/10',
  worship: 'bg-orange-50 text-orange-700 ring-orange-700/10',
};

const ITEMS_PER_PAGE = 10;

export const MinistryMembersTab = ({ ministry, onRefresh }) => {
  const { members, loading, refresh, deleteMember } = useMinistryMembers(ministry?.id);
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalState, setEditModalState] = useState({ open: false, member: null });
  const [deleteModalState, setDeleteModalState] = useState({ open: false, member: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMembers = members.slice(startIndex, endIndex);

  // Reset to page 1 when members change
  const handleAddSuccess = async () => {
    setAddModalOpen(false);
    await refresh();
    setCurrentPage(1); // Reset to first page
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleEditSuccess = async () => {
    setEditModalState({ open: false, member: null });
    await refresh();
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteModalState.member) return;

    try {
      await deleteMember(deleteModalState.member.id);
      showSuccess('Volunteer removed from ministry');
      setDeleteModalState({ open: false, member: null });

      // If current page becomes empty after delete, go to previous page
      const remainingMembers = members.length - 1;
      const maxPage = Math.ceil(remainingMembers / ITEMS_PER_PAGE);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError('Failed to remove volunteer');
      console.error(err);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Volunteer Roster</h3>
            <p className="text-sm text-gray-600 mt-1">
              {members.length} {members.length === 1 ? 'volunteer' : 'volunteers'} serving in this ministry
              {members.length > ITEMS_PER_PAGE && (
                <span className="text-gray-500"> • Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </div>
          <PrimaryButton icon={HiUserAdd} onClick={() => setAddModalOpen(true)}>
            Add Volunteer
          </PrimaryButton>
        </div>

        {/* Empty State */}
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
          <>
            {/* Members Table */}
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Available Days
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                      Max Shifts
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedMembers.map((member) => {
                    const userName = member.member
                      ? `${member.member.first_name || ''} ${member.member.last_name || ''}`.trim() ||
                        member.member.full_name
                      : 'Unknown';
                    const userEmail = member.member?.email || 'No email';

                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        {/* Name */}
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-sbcc-primary flex items-center justify-center text-white font-semibold">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{userName}</div>
                              <div className="text-gray-500">{userEmail}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            ROLE_COLORS[member.role] || ROLE_COLORS.volunteer
                          }`}>
                            {ROLE_LABELS[member.role] || member.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {member.is_active ? (
                            <div className="flex items-center gap-1.5 text-green-700">
                              <HiCheckCircle className="h-5 w-5" />
                              <span className="text-xs font-medium">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <HiXCircle className="h-5 w-5" />
                              <span className="text-xs font-medium">Inactive</span>
                            </div>
                          )}
                        </td>

                        {/* Available Days */}
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="max-w-xs">
                            {Array.isArray(member.available_days) && member.available_days.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {member.available_days.map((day) => (
                                  <span
                                    key={day}
                                    className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                                  >
                                    {day.slice(0, 3)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Any day</span>
                            )}
                          </div>
                        </td>

                        {/* Max Consecutive Shifts */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                            {member.max_consecutive_shifts || '∞'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <IconButton
                              icon={HiPencil}
                              onClick={() => setEditModalState({ open: true, member })}
                              className="text-gray-600 hover:text-sbcc-primary"
                              title="Edit volunteer"
                            />
                            <IconButton
                              icon={HiTrash}
                              onClick={() => setDeleteModalState({ open: true, member })}
                              className="text-gray-600 hover:text-red-600"
                              title="Remove volunteer"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, members.length)}</span> of{' '}
                      <span className="font-medium">{members.length}</span> volunteers
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis =
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span
                              key={page}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                            >
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === page
                                ? 'z-10 bg-sbcc-primary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sbcc-primary'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <HiChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
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
