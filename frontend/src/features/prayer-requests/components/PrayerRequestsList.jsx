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
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
