import React from 'react';
import PrayerRequestCard from './PrayerRequestCard';
import EmptyState from '../../../components/ui/EmptyState';

export function PrayerRequestsList({
  requests,
  loading,
  onView,
  onAssign,
  onFollowUp
}) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-gray-200 rounded-full w-16" />
              <div className="h-5 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-4/6" />
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
              <div className="h-8 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
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
