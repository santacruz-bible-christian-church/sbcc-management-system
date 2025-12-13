import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';
import { formatDateTime } from '../../../utils/format';
import usePrayerRequestDetails from '../hooks/usePrayerRequestDetails';

const PrayerRequestsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading, error } = usePrayerRequestDetails(id);

  const handleBack = () => {
    navigate('/prayer-requests');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prayer Request Details" />
        <Card className="p-6">
          <p className="text-sm text-sbcc-gray">
            Loading prayer request details…
          </p>
        </Card>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6">
        <PageHeader title="Prayer Request Details" />
        <Card className="flex flex-col gap-4 p-6">
          <p className="text-sm text-red-600">
            Unable to load this prayer request. It may have been removed or
            there was a server error.
          </p>
          <div>
            <Button variant="secondary" onClick={handleBack}>
              Back to list
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const {
    title,
    description,
    name,
    email,
    is_anonymous,
    created_at,
    status,
  } = request;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prayer Request Details"
        description="View full details for this prayer request."
        actions={
          <Button variant="secondary" onClick={handleBack}>
            Back to list
          </Button>
        }
      />

      <Card className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sbcc-gray">
              {status || 'Pending'}
            </p>
            <h2 className="text-lg font-semibold text-sbcc-dark">
              {title || 'Prayer Request'}
            </h2>
          </div>

          <div className="text-right text-xs text-sbcc-gray">
            <p>Submitted {formatDateTime(created_at)}</p>
          </div>
        </div>

        <hr className="border-sbcc-gray/20" />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sbcc-gray">
            Request
          </h3>
          <p className="whitespace-pre-line text-sm text-sbcc-dark">
            {description}
          </p>
        </div>

        <hr className="border-sbcc-gray/20" />

        <div className="space-y-2 text-sm text-sbcc-gray">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sbcc-gray">
            Submitted by
          </h3>

          {is_anonymous ? (
            <p className="italic text-sbcc-gray">Shared anonymously</p>
          ) : (
            <>
              <p className="font-medium text-sbcc-dark">{name}</p>
              {email && <p className="text-xs text-sbcc-gray">{email}</p>}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PrayerRequestsDetails;
