import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatDateTime } from '../../../utils/format';
import { PRIORITY_METADATA, STATUS_METADATA } from '../utils/constants';

function truncate(text, max = 140) {
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
    <Card className="flex flex-col justify-between gap-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-sbcc-dark flex-1">
            {title || 'Prayer Request'}
          </h3>
          <span className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap ${priorityInfo.color}`}>
            {priorityInfo.icon} {priorityInfo.label}
          </span>
        </div>

        {/* Category & Status */}
        <div className="flex flex-wrap gap-2 text-xs">
          {category_display && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              {category_display}
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-3 py-1" style={{ color: statusInfo.tint }}>
            {statusInfo.icon} {statusInfo.label}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
            📅 {formatDateTime(submitted_at)}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-sbcc-gray">
        {truncate(description, 150)}
      </p>

      {/* Requester Info */}
      <div className="text-xs text-sbcc-gray border-t pt-3">
        {is_anonymous ? (
          <span className="italic">Shared anonymously</span>
        ) : (
          <div>
            <span className="font-medium text-sbcc-dark">
              {requester_name_display || 'Unknown'}
            </span>
            {requester_email && (
              <span className="ml-1 text-xs text-sbcc-gray">
                ({requester_email})
              </span>
            )}
          </div>
        )}

        {/* Assignment Info */}
        {assigned_to_name && (
          <div className="mt-2 rounded-lg bg-sbcc-primary/10 px-3 py-2">
            <span className="text-xs text-sbcc-dark">
              👤 Assigned to: <strong>{assigned_to_name}</strong>
            </span>
          </div>
        )}

        {/* Follow-up Count */}
        {follow_up_count > 0 && (
          <div className="mt-2">
            <span className="text-xs text-green-700">
              ✓ {follow_up_count} follow-up{follow_up_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        {onView && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(id)}
            className="flex-1"
          >
            View Details
          </Button>
        )}
        {onAssign && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssign(request)}
            className="flex-1"
          >
            {assigned_to_name ? 'Reassign' : 'Assign'}
          </Button>
        )}
        {onFollowUp && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onFollowUp(request)}
            className="flex-1"
          >
            Follow Up
          </Button>
        )}
      </div>
    </Card>
  );
}

export default PrayerRequestCard;
