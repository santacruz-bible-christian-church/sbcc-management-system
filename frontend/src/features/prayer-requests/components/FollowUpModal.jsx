import React from 'react';
import { HiX } from 'react-icons/hi';
import { FOLLOW_UP_ACTION_OPTIONS, PRAYER_STATUS_OPTIONS } from '../utils/constants';

const FollowUpModal = ({
  isOpen,
  onClose,
  request,
  formData,
  onChange,
  onSubmit,
  submitting = false,
}) => {
  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Add Follow-Up</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiX className="text-3xl" />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-800">{request.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            by {request.requester_name_display}
          </p>
        </div>

        {/* Previous Follow-Ups */}
        {request.follow_ups && request.follow_ups.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Previous Follow-Ups
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {request.follow_ups.map((followUp) => (
                <div
                  key={followUp.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {followUp.created_by_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {followUp.action_type_display}
                        {followUp.is_private && ' (Private)'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(followUp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{followUp.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={formData.action_type}
              onChange={(e) => onChange({ ...formData, action_type: e.target.value })}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {FOLLOW_UP_ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-Up Note <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => onChange({ ...formData, notes: e.target.value })}
              disabled={submitting}
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Share an update, testimony, or continued prayer points..."
            />
          </div>

          {/* Update Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Status (Optional)
            </label>
            <select
              value={formData.update_status}
              onChange={(e) => onChange({ ...formData, update_status: e.target.value })}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Keep current status</option>
              {PRAYER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_private_followup"
              checked={formData.is_private}
              onChange={(e) => onChange({ ...formData, is_private: e.target.checked })}
              disabled={submitting}
              className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D] disabled:cursor-not-allowed"
            />
            <label htmlFor="is_private_followup" className="text-sm text-gray-700">
              Private note (visible only to prayer team)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Follow-Up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FollowUpModal;
