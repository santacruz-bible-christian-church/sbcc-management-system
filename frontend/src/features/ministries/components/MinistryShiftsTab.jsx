import { useCallback, useEffect, useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUserCircle } from 'react-icons/hi';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, Button } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import CreateShiftModal from './CreateShiftModal';

export const MinistryShiftsTab = ({ ministryId, ministry, canManage, onRefresh }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ open: false, shift: null });
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('=== FETCHING SHIFTS ===');
      console.log('Ministry ID:', ministryId);

      const data = await ministriesApi.listShifts({ ministry: ministryId });
      const shiftsList = Array.isArray(data) ? data : data.results || [];

      console.log('Fetched shifts:', shiftsList.length);
      setShifts(shiftsList);
    } catch (err) {
      console.error('Failed to load shifts:', err);
      showError('Unable to load shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId, showError]);

  useEffect(() => {
    if (ministryId) {
      fetchShifts();
    }
  }, [fetchShifts, ministryId]);

  const handleCreateSuccess = async () => {
    setCreateModalOpen(false);
    await fetchShifts();
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteModalState.shift) return;

    try {
      await ministriesApi.deleteShift(deleteModalState.shift.id);
      showSuccess('Shift deleted successfully');
      setDeleteModalState({ open: false, shift: null });
      await fetchShifts();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError('Failed to delete shift');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sbcc-primary border-t-transparent"></div>
        <p className="mt-3 text-gray-500">Loading shifts...</p>
      </div>
    );
  }

  const assignedShifts = shifts.filter(s => s.assignment_info);
  const unassignedShifts = shifts.filter(s => !s.assignment_info);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shifts</h3>
            <p className="text-sm text-gray-600 mt-1">
              {shifts.length} total ({assignedShifts.length} assigned, {unassignedShifts.length} unassigned)
            </p>
          </div>
          {canManage && (
            <PrimaryButton icon={HiOutlinePlus} onClick={() => setCreateModalOpen(true)}>
              Create Shift
            </PrimaryButton>
          )}
        </div>

        {/* Empty State */}
        {shifts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <HiOutlineUserCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shifts scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first shift.</p>
            {canManage && (
              <div className="mt-6">
                <PrimaryButton onClick={() => setCreateModalOpen(true)}>
                  Create First Shift
                </PrimaryButton>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unassigned Shifts */}
            {unassignedShifts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    {unassignedShifts.length}
                  </span>
                  Unassigned Shifts
                </h4>
                <div className="space-y-3">
                  {unassignedShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                              Needs Assignment
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(shift.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </p>
                          {shift.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {shift.notes}
                            </p>
                          )}
                        </div>
                        {canManage && (
                          <div className="flex gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              icon={HiOutlineTrash}
                              onClick={() => setDeleteModalState({ open: true, shift })}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Shifts */}
            {assignedShifts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {assignedShifts.length}
                  </span>
                  Assigned Shifts
                </h4>
                <div className="space-y-3">
                  {assignedShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                              Assigned
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(shift.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </p>
                          {shift.assignment_info && (
                            <div className="mt-2 flex items-center gap-2">
                              <HiOutlineUserCircle className="w-5 h-5 text-gray-400" />
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">{shift.assignment_info.user_name}</span>
                                {shift.assignment_info.user_email && (
                                  <span className="text-gray-500"> • {shift.assignment_info.user_email}</span>
                                )}
                              </p>
                            </div>
                          )}
                          {shift.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {shift.notes}
                            </p>
                          )}
                        </div>
                        {canManage && (
                          <div className="flex gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              icon={HiOutlineTrash}
                              onClick={() => setDeleteModalState({ open: true, shift })}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Shift Modal */}
        <CreateShiftModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          ministry={ministry}
          ministryId={ministryId}
          onSuccess={handleCreateSuccess}
        />

        {/* Delete Confirmation */}
        <ConfirmationModal
          open={deleteModalState.open}
          title="Delete Shift?"
          message="Are you sure you want to delete this shift? If it has an assignment, the volunteer will be unassigned. This action cannot be undone."
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalState({ open: false, shift: null })}
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

export default MinistryShiftsTab;
