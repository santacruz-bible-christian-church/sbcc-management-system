//// filepath: c:\Users\63923\Desktop\sbcc-management-system\frontend\src\features\prayer_requests\components\PrayerRequestCard.jsx
import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatDateTime } from '../../../utils/format';

function truncate(text, max = 140) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function PrayerRequestCard({ request, onView }) {
  if (!request) return null;

  const {
    id,
    name,
    email,
    title,
    description,
    created_at,
    is_anonymous,
    status,
  } = request;

  return (
    <Card className="flex flex-col justify-between gap-3">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-sbcc-gray">
          {status || 'Pending'} • {formatDateTime(created_at)}
        </p>
        <h3 className="text-base font-semibold text-sbcc-dark">
          {title || 'Prayer Request'}
        </h3>
        <p className="text-sm text-sbcc-gray">
          {truncate(description, 200)}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-sbcc-gray">
        <div>
          {is_anonymous ? (
            <span className="italic">Shared anonymously</span>
          ) : (
            <>
              <span className="font-medium text-sbcc-dark">{name}</span>
              {email && (
                <span className="ml-1 text-xs text-sbcc-gray">
                  ({email})
                </span>
              )}
            </>
          )}
        </div>

        {onView && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(id)}
          >
            View details
          </Button>
        )}
      </div>
    </Card>
  );
}

export default PrayerRequestCard;
