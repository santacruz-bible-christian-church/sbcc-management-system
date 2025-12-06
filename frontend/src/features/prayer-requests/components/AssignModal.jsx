import React from 'react';
import { HiX, HiUser, HiCheck } from 'react-icons/hi';

const AssignModal = ({
  isOpen,
  onClose,
  request,
  teamMembers,
  selectedUserId,
  onSelectUser,
  onAssign
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Assign Prayer Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="text-3xl" />
          </button>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          Assign "{request.title}" to a prayer team member
        </p>

        <div className="space-y-3 mb-6">
          {teamMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectUser(String(member.id))}
              className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-[#FFB84D] hover:bg-[#FFB84D]/5 text-left ${
                selectedUserId === String(member.id)
                  ? 'border-[#FFB84D] bg-[#FFB84D]/10'
                  : 'border-gray-200'
              }`}
            >
              <HiUser className="text-3xl text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
              </div>
              {selectedUserId === String(member.id) && (
                <HiCheck className="text-[#FFB84D] text-2xl" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAssign}
            disabled={!selectedUserId}
            className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignModal;
