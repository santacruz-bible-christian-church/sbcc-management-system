import React from 'react';
import PrayerRequestCard from './PrayerRequestCard';
import EmptyState from '../../../components/ui/EmptyState';

export function PrayerRequestsList({ requests, loading, onView }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-sbcc-gray/20 bg-white p-6">
        <p className="text-sm text-sbcc-gray">Loading prayer requests…</p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
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
        />
      ))}
    </div>
  );
}

export default PrayerRequestsList;
