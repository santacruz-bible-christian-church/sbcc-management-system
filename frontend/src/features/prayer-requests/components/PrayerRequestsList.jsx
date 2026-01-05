import React from 'react';
import { HiOutlineUser, HiOutlineCalendar, HiOutlineEye, HiOutlineUserAdd, HiOutlineAnnotation, HiOutlineChatAlt2 } from 'react-icons/hi';
import PrayerRequestCard from './PrayerRequestCard';
import EmptyState from '../../../components/ui/EmptyState';
import { formatDateTime } from '../../../utils/format';
import { PRIORITY_METADATA, STATUS_METADATA } from '../utils/constants';

// List Row Component for list view
function PrayerRequestRow({ request, onView, onAssign, onFollowUp }) {
  const {
    id,
    title,
    requester_name_display,
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
    <div className="group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Priority indicator */}
        <div
          className="w-1 h-10 rounded-full shrink-0"
          style={{ backgroundColor: priorityInfo.tint }}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {title || 'Prayer Request'}
            </h3>
            <span
              className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${statusInfo.tint}15`, color: statusInfo.tint }}
            >
              {statusInfo.label}
            </span>
            {category_display && (
              <span className="shrink-0 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                {category_display}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HiOutlineUser className="w-3 h-3" />
              {is_anonymous ? 'Anonymous' : requester_name_display || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <HiOutlineCalendar className="w-3 h-3" />
              {formatDateTime(submitted_at)}
            </span>
            {assigned_to_name && (
              <span className="flex items-center gap-1 text-amber-600">
                <HiOutlineUserAdd className="w-3 h-3" />
                {assigned_to_name}
              </span>
            )}
            {follow_up_count > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <HiOutlineChatAlt2 className="w-3 h-3" />
                {follow_up_count}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={() => onView(id)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Details"
            >
              <HiOutlineEye className="w-4 h-4" />
            </button>
          )}
          {onAssign && (
            <button
              onClick={() => onAssign(request)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={assigned_to_name ? 'Reassign' : 'Assign'}
            >
              <HiOutlineUserAdd className="w-4 h-4" />
            </button>
          )}
          {onFollowUp && (
            <button
              onClick={() => onFollowUp(request)}
              className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Follow Up"
            >
              <HiOutlineAnnotation className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Grid Skeleton
function GridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white overflow-hidden"
        >
          <div className="h-1 bg-gray-200" />
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-100">
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// List Skeleton
function ListSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrayerRequestsList({
  requests,
  loading,
  viewMode = 'grid',
  onView,
  onAssign,
  onFollowUp
}) {
  if (loading) {
    return viewMode === 'list' ? <ListSkeleton /> : <GridSkeleton />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon="🙏"
        title="No prayer requests yet"
        description="When prayer requests are submitted, they will appear here for review and follow-up."
      />
    );
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {requests.map((req) => (
          <PrayerRequestRow
            key={req.id}
            request={req}
            onView={onView}
            onAssign={onAssign}
            onFollowUp={onFollowUp}
          />
        ))}
      </div>
    );
  }

  // Grid View (default)
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {requests.map((req) => (
        <PrayerRequestCard
          key={req.id}
          request={req}
          onView={onView}
          onAssign={onAssign}
          onFollowUp={onFollowUp}
        />
      ))}
    </div>
  );
}

export default PrayerRequestsList;
