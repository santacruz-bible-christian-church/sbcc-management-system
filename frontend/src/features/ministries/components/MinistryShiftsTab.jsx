import { useState, useMemo } from 'react';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineUserCircle,
  HiChevronDown,
  HiChevronUp,
  HiUserGroup,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiPencilAlt
} from 'react-icons/hi';
import { useMinistryShifts } from '../hooks/useMinistryShifts';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, Button, IconButton } from '../../../components/ui/Button';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import CreateShiftModal from './CreateShiftModal';

export const MinistryShiftsTab = ({ ministryId, ministry, canManage, onRefresh }) => {
  const { shifts, loading, deleteShift } = useMinistryShifts(ministryId);
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ open: false, shift: null, isGroup: false, groupShifts: [] });
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Group shifts by date and time
  const groupedShifts = useMemo(() => {
    const groups = {};

    shifts.forEach(shift => {
      const key = `${shift.date}-${shift.start_time}-${shift.end_time}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          date: shift.date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          shifts: [],
          notes: shift.notes || '' // Get notes from first shift
        };
      }
      groups[key].shifts.push(shift);
    });

    // Sort groups by date and time
    return Object.values(groups).sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  }, [shifts]);

  const handleCreateSuccess = async () => {
    setCreateModalOpen(false);
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteModalState.shift) return;

    try {
      await deleteShift(deleteModalState.shift.id);
      showSuccess('Shift deleted successfully');
      setDeleteModalState({ open: false, shift: null, isGroup: false, groupShifts: [] });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError('Failed to delete shift');
      console.error(err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteModalState.groupShifts || deleteModalState.groupShifts.length === 0) return;

    try {
      await Promise.all(deleteModalState.groupShifts.map(shift => deleteShift(shift.id)));
      showSuccess(`${deleteModalState.groupShifts.length} shifts deleted successfully`);
      setDeleteModalState({ open: false, shift: null, isGroup: false, groupShifts: [] });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      showError('Failed to delete shifts');
      console.error(err);
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const getGroupStats = (group) => {
    const assigned = group.shifts.filter(s => s.assignment_info).length;
    const total = group.shifts.length;
    return { assigned, total, unassigned: total - assigned };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sbcc-primary border-t-transparent"></div>
        <p className="mt-3 text-gray-500">Loading shifts...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Shifts</h3>
            <p className="text-sm text-gray-600 mt-1">
              {groupedShifts.length} time {groupedShifts.length === 1 ? 'slot' : 'slots'} • {shifts.length} total {shifts.length === 1 ? 'position' : 'positions'}
            </p>
          </div>
          {canManage && (
            <PrimaryButton icon={HiOutlinePlus} onClick={() => setCreateModalOpen(true)}>
              Create Shift
            </PrimaryButton>
          )}
        </div>

        {/* Empty State */}
        {groupedShifts.length === 0 ? (
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
          <div className="space-y-4">
            {groupedShifts.map((group) => {
              const { assigned, total, unassigned } = getGroupStats(group);
              const isExpanded = expandedGroups.has(group.key);
              const isFullyAssigned = assigned === total;
              const hasUnassigned = unassigned > 0;

              return (
                <div
                  key={group.key}
                  className={`rounded-lg border-2 transition-all ${
                    hasUnassigned
                      ? 'border-yellow-200 bg-yellow-50/30'
                      : 'border-green-200 bg-white'
                  } ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                >
                  {/* Group Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date and Time */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <HiCalendar className="w-5 h-5 text-sbcc-primary" />
                            <h4 className="text-base font-semibold text-gray-900">
                              {formatDate(group.date)}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <HiClock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(group.start_time)} - {formatTime(group.end_time)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {isFullyAssigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                              <HiCheckCircle className="w-4 h-4" />
                              Fully Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                              <HiExclamationCircle className="w-4 h-4" />
                              {unassigned} Unfilled {unassigned === 1 ? 'Slot' : 'Slots'}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                            <HiUserGroup className="w-4 h-4" />
                            {assigned}/{total} Assigned
                          </span>
                        </div>

                        {/* Notes Preview */}
                        {group.notes && !isExpanded && (
                          <div className="flex items-start gap-2 mt-3">
                            <HiPencilAlt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-500 italic line-clamp-1">
                              {group.notes.replace(/\(Shift \d+\/\d+\)/g, '').trim()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {canManage && (
                          <IconButton
                            icon={HiOutlineTrash}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModalState({
                                open: true,
                                shift: null,
                                isGroup: true,
                                groupShifts: group.shifts
                              });
                            }}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete all shifts in this time slot"
                          />
                        )}
                        <button
                          onClick={() => toggleGroup(group.key)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? (
                            <HiChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <HiChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {/* Full Notes */}
                        {group.notes && (
                          <div className="flex items-start gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
                            <HiPencilAlt className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">Notes: </span>
                              <span className="text-sm text-gray-600">{group.notes.replace(/\(Shift \d+\/\d+\)/g, '').trim()}</span>
                            </div>
                          </div>
                        )}

                        {/* Volunteer Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.shifts.map((shift, index) => (
                            <div
                              key={shift.id}
                              className={`relative rounded-lg border-2 p-3 transition-all ${
                                shift.assignment_info
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-dashed border-gray-300 bg-gray-50'
                              }`}
                            >
                              {/* Position Number */}
                              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-sbcc-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                                {index + 1}
                              </div>

                              {shift.assignment_info ? (
                                // Assigned Volunteer
                                <div className="pl-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <div className="w-8 h-8 rounded-full bg-sbcc-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {shift.assignment_info.user_name?.charAt(0).toUpperCase() || 'V'}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                          {shift.assignment_info.user_name}
                                        </p>
                                        <p className="text-xs text-gray-600 truncate">
                                          {shift.assignment_info.user_email}
                                        </p>
                                      </div>
                                    </div>
                                    {canManage && (
                                      <IconButton
                                        icon={HiOutlineTrash}
                                        onClick={() => setDeleteModalState({
                                          open: true,
                                          shift,
                                          isGroup: false,
                                          groupShifts: []
                                        })}
                                        className="text-gray-400 hover:text-red-600 flex-shrink-0"
                                        size="sm"
                                        title="Remove this assignment"
                                      />
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // Empty Slot
                                <div className="pl-4 flex items-center justify-center py-2">
                                  <div className="text-center">
                                    <HiOutlineUserCircle className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs font-medium text-gray-500">Empty Slot</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Not assigned</p>
                                  </div>
                                  {canManage && (
                                    <IconButton
                                      icon={HiOutlineTrash}
                                      onClick={() => setDeleteModalState({
                                        open: true,
                                        shift,
                                        isGroup: false,
                                        groupShifts: []
                                      })}
                                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                                      size="sm"
                                      title="Delete this empty slot"
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Expand/Collapse Hint */}
                        <button
                          onClick={() => toggleGroup(group.key)}
                          className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <HiChevronUp className="w-4 h-4" />
                          Click to collapse
                        </button>
                      </div>
                    )}

                    {/* Collapsed Preview (show volunteer avatars) */}
                    {!isExpanded && group.shifts.length > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {group.shifts.slice(0, 5).map((shift, index) => (
                            <div
                              key={shift.id}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm ${
                                shift.assignment_info
                                  ? 'bg-sbcc-primary text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}
                              title={shift.assignment_info?.user_name || 'Empty slot'}
                            >
                              {shift.assignment_info
                                ? shift.assignment_info.user_name?.charAt(0).toUpperCase()
                                : <HiOutlineUserCircle className="w-5 h-5" />}
                            </div>
                          ))}
                          {group.shifts.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold border-2 border-white shadow-sm">
                              +{group.shifts.length - 5}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleGroup(group.key)}
                          className="text-xs text-sbcc-primary hover:text-sbcc-orange font-medium flex items-center gap-1"
                        >
                          View Details
                          <HiChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
          title={deleteModalState.isGroup ? "Delete All Shifts?" : "Delete Shift?"}
          message={
            deleteModalState.isGroup
              ? `Are you sure you want to delete all ${deleteModalState.groupShifts.length} shifts in this time slot? This will unassign all volunteers. This action cannot be undone.`
              : "Are you sure you want to delete this shift? If it has an assignment, the volunteer will be unassigned. This action cannot be undone."
          }
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={deleteModalState.isGroup ? handleDeleteGroup : handleDeleteSingle}
          onCancel={() => setDeleteModalState({ open: false, shift: null, isGroup: false, groupShifts: [] })}
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
