import React from 'react';
import { HiOutlineUser, HiOutlineCalendar, HiOutlineChatAlt2, HiOutlineEye, HiOutlineUserAdd, HiOutlineAnnotation } from 'react-icons/hi';
import { formatDateTime } from '../../../utils/format';
import { PRIORITY_METADATA, STATUS_METADATA } from '../utils/constants';

function truncate(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function PrayerRequestCard({ request, onView, onAssign, onFollowUp }) {
  if (!request) return null;

  const {
    id,
    title,
    description,
    requester_name_display,
    requester_email,
    submitted_at,
    is_anonymous,
    status,
    priority,
    category_display,
    assigned_to_name,
    follow_up_count,
  } = request;

  const priorityInfo = PRIORITY_METADATA[priority] || PRIORITY_METADATA.medium;
  const statusInfo = STATUS_METADATA[status] || STATUS_METADATA.pending;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden">
      {/* Priority Accent Bar */}
      <div
        className="h-1"
        style={{ backgroundColor: priorityInfo.tint || '#FDB54A' }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-gray-900 leading-snug flex-1 line-clamp-2">
            {title || 'Prayer Request'}
          </h3>
          <span
            className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${priorityInfo.tint}15`,
              color: priorityInfo.tint
            }}
          >
            {priorityInfo.label}
          </span>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {category_display && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
              {category_display}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${statusInfo.tint}15`,
              color: statusInfo.tint
            }}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {truncate(description, 120)}
        </p>

        {/* Meta Info */}
        <div className="space-y-2 pt-3 border-t border-gray-100">
          {/* Requester */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <HiOutlineUser className="w-3.5 h-3.5" />
            {is_anonymous ? (
              <span className="italic">Shared anonymously</span>
            ) : (
              <span className="font-medium text-gray-700">
                {requester_name_display || 'Unknown'}
                {requester_email && (
                  <span className="font-normal text-gray-400 ml-1">({requester_email})</span>
                )}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <HiOutlineCalendar className="w-3.5 h-3.5" />
            <span>{formatDateTime(submitted_at)}</span>
          </div>

          {/* Assignment */}
          {assigned_to_name && (
            <div className="flex items-center gap-2 text-xs mt-2">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 rounded-md px-2 py-1">
                <HiOutlineUserAdd className="w-3.5 h-3.5" />
                <span>Assigned to <strong>{assigned_to_name}</strong></span>
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {follow_up_count > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 rounded-md px-2 py-1">
                <HiOutlineChatAlt2 className="w-3.5 h-3.5" />
                <span>{follow_up_count} follow-up{follow_up_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
          {onView && (
            <button
              onClick={() => onView(id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <HiOutlineEye className="w-4 h-4" />
              View
            </button>
          )}
          {onAssign && (
            <button
              onClick={() => onAssign(request)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <HiOutlineUserAdd className="w-4 h-4" />
              {assigned_to_name ? 'Reassign' : 'Assign'}
            </button>
          )}
          {onFollowUp && (
            <button
              onClick={() => onFollowUp(request)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors whitespace-nowrap"
            >
              <HiOutlineAnnotation className="w-4 h-4" />
              Follow Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrayerRequestCard;
