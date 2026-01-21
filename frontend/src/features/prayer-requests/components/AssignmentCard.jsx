import React from 'react';
import { HiOutlineUserAdd, HiOutlineRefresh } from 'react-icons/hi';

// Generate initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AssignmentCard = ({ request, onReassign, isCompleted }) => {
  const { assigned_to_name, status } = request;
  const isAssigned = !!assigned_to_name;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Assignment
      </h3>

      {isAssigned ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
              {getInitials(assigned_to_name)}
            </div>

            {/* Name */}
            <div>
              <p className="font-medium text-gray-900">{assigned_to_name}</p>
              <p className="text-xs text-gray-500">Assigned Pastor</p>
            </div>
          </div>

          {/* Reassign button */}
          {!isCompleted && onReassign && (
            <button
              onClick={onReassign}
              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Reassign"
            >
              <HiOutlineRefresh className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <HiOutlineUserAdd className="w-5 h-5" />
            </div>
            <p className="text-sm">Not assigned</p>
          </div>

          {/* Assign button */}
          {!isCompleted && onReassign && (
            <button
              onClick={onReassign}
              className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Assign
            </button>
          )}
        </div>
      )}

      {/* Status indicator */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'completed'
                ? 'bg-green-500'
                : status === 'in_progress'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-xs text-gray-500 capitalize">
            {status?.replace('_', ' ') || 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
