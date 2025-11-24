import { useState } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX, HiCheckCircle, HiExclamationCircle, HiClock } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

export const ShiftRotationModal = ({ open, onClose, ministry, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError, showWarning } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [formData, setFormData] = useState({
    days: 7,
    notify: false,
    dry_run: true,
    limit_per_ministry: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTimeoutWarning(false);

    // Show processing indicator for large operations
    const shiftCount = formData.days * 2; // Rough estimate
    const isLargeOperation = shiftCount > 20 || formData.days > 30;

    if (isLargeOperation) {
      showWarning('Processing large operation... This may take up to 30 seconds.');
    }

    try {
      console.log('=== ROTATING SHIFTS ===');
      console.log('Ministry:', ministry.name);
      console.log('Params:', formData);

      const startTime = Date.now();

      const response = await ministriesApi.rotateShifts(ministry.id, formData);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Rotation completed in ${duration}s`);
      console.log('Rotation result:', response);

      setResult(response);

      // Check for partial success
      const hasErrors = response.errors?.length > 0;
      const hasSkipped = (response.skipped_no_members?.length > 0) ||
                        (response.skipped_no_available?.length > 0);

      if (formData.dry_run) {
        if (response.created === 0) {
          showWarning('No assignments available. Check shift dates and volunteer availability.');
        } else if (hasErrors || hasSkipped) {
          showWarning(`Preview: ${response.created} assignments possible (with warnings)`);
        } else {
          showSuccess(`Preview: ${response.created} assignments would be created`);
        }
      } else {
        if (response.created === 0) {
          showError('No assignments created. Please check your shifts and volunteers.');
        } else if (hasErrors) {
          showWarning(
            `Created ${response.created} assignments with ${response.errors.length} errors.${
              response.emailed > 0 ? ` ${response.emailed} emails sent.` : ''
            }`
          );
        } else {
          showSuccess(
            `Successfully created ${response.created} assignments!${
              response.emailed > 0 ? ` ${response.emailed} emails sent.` : ''
            }`
          );

          // Call success callback to refresh shifts
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (err) {
      console.error('Rotation error:', err);

      // Handle timeout errors
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setTimeoutWarning(true);
        showError(
          'Request timed out. The operation may still be processing. Please refresh the page in a moment.'
        );
      }
      // Handle network errors
      else if (err.message === 'Network Error' || !err.response) {
        showError(
          'Network error. Please check your connection and try again.'
        );
      }
      // Handle validation errors
      else if (err.response?.status === 400) {
        const errorData = err.response.data;
        let errorMsg = 'Invalid request. ';

        if (errorData.detail) {
          errorMsg += errorData.detail;
        } else if (errorData.days) {
          errorMsg += `Days: ${errorData.days[0]}`;
        } else if (errorData.limit_per_ministry) {
          errorMsg += `Limit: ${errorData.limit_per_ministry[0]}`;
        } else {
          errorMsg += 'Please check your inputs.';
        }

        showError(errorMsg);
      }
      // Handle permission errors
      else if (err.response?.status === 403) {
        showError('You do not have permission to rotate shifts.');
      }
      // Handle not found
      else if (err.response?.status === 404) {
        showError('Ministry not found. Please refresh the page.');
      }
      // Handle server errors
      else if (err.response?.status >= 500) {
        showError(
          'Server error occurred. Please try again or contact support if the issue persists.'
        );
      }
      // Generic error
      else {
        showError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to rotate shifts. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setFormData({ ...formData, dry_run: false });
    setLoading(true);
    setTimeoutWarning(false);

    try {
      const startTime = Date.now();

      const response = await ministriesApi.rotateShifts(ministry.id, {
        ...formData,
        dry_run: false,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Confirmation completed in ${duration}s`);

      setResult(response);

      if (response.created === 0) {
        showError('No assignments created. Please check your shifts and volunteers.');
      } else if (response.errors?.length > 0) {
        showWarning(
          `Created ${response.created} assignments with ${response.errors.length} errors.${
            response.emailed > 0 ? ` ${response.emailed} emails sent.` : ''
          }`
        );
      } else {
        showSuccess(
          `Successfully created ${response.created} assignments!${
            response.emailed > 0 ? ` ${response.emailed} emails sent.` : ''
          }`
        );
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Only close if fully successful
      if (response.errors?.length === 0) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (err) {
      console.error('Confirmation error:', err);

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setTimeoutWarning(true);
        showError(
          'Request timed out. The assignments may still be creating. Please refresh the page in a moment.'
        );
      } else if (err.response?.status >= 500) {
        showError(
          'Server error during confirmation. Please refresh and check if assignments were created.'
        );
      } else {
        showError(err.response?.data?.detail || 'Failed to create assignments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (!loading && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResult(null);
      setTimeoutWarning(false);
      setFormData({
        days: 7,
        notify: false,
        dry_run: true,
        limit_per_ministry: 0,
      });
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Rotate & Assign Shifts</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically assign volunteers to upcoming shifts for {ministry?.name}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Timeout Warning */}
              {timeoutWarning && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HiClock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">Request Timed Out</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        The operation is taking longer than expected. The assignments may still be processing in the background.
                        Please refresh the shifts tab in a moment to see if they were created.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTimeoutWarning(false);
                          if (onSuccess) onSuccess();
                        }}
                        className="mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
                      >
                        Refresh Shifts Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Days Ahead */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Look Ahead (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Number of days ahead to assign shifts (default: 7)
                  {formData.days > 30 && (
                    <span className="block text-yellow-600 mt-1">
                      ⚠️ Large date ranges may take longer to process
                    </span>
                  )}
                </p>
              </div>

              {/* Limit Per Ministry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Assignments (0 = Unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.limit_per_ministry}
                  onChange={(e) => setFormData({ ...formData, limit_per_ministry: Number(e.target.value) })}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of shifts to assign (0 for no limit)
                </p>
              </div>

              {/* Notify */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify"
                  checked={formData.notify}
                  onChange={(e) => setFormData({ ...formData, notify: e.target.checked })}
                  disabled={loading}
                  className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary disabled:cursor-not-allowed"
                />
                <label htmlFor="notify" className="text-sm font-medium text-gray-700">
                  Send email notifications to assigned volunteers
                  {formData.notify && (
                    <span className="block text-xs text-gray-500 mt-0.5">
                      Email sending may add 1-2 seconds per assignment
                    </span>
                  )}
                </label>
              </div>

              {/* Result Display */}
              {result && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <HiCheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        {formData.dry_run ? 'Preview Results' : 'Assignments Created'}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800">
                        <li>✅ {result.created} assignments {formData.dry_run ? 'would be created' : 'created'}</li>
                        {result.emailed > 0 && (
                          <li>📧 {result.emailed} email notifications sent</li>
                        )}
                        {result.skipped_no_members?.length > 0 && (
                          <li className="text-yellow-700">
                            ⚠️ {result.skipped_no_members.length} ministries skipped (no active volunteers)
                          </li>
                        )}
                        {result.skipped_no_available?.length > 0 && (
                          <li className="text-yellow-700">
                            ⚠️ {result.skipped_no_available.length} shifts couldn't be assigned (no available volunteers)
                          </li>
                        )}
                        {result.errors?.length > 0 && (
                          <li className="text-red-700">
                            ❌ {result.errors.length} errors occurred
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result?.errors && result.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-48 overflow-y-auto">
                  <div className="flex items-start gap-2">
                    <HiExclamationCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Errors ({result.errors.length}):</p>
                      <ul className="mt-2 space-y-1 text-sm text-red-800">
                        {result.errors.slice(0, 10).map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li className="text-red-600 font-medium">
                            ... and {result.errors.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <SecondaryButton
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Cancel'}
                </SecondaryButton>

                {formData.dry_run && !result && (
                  <PrimaryButton
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Previewing...' : 'Preview Assignments'}
                  </PrimaryButton>
                )}

                {formData.dry_run && result && result.created > 0 && (
                  <PrimaryButton
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : `Confirm & Create ${result.created} Assignments`}
                  </PrimaryButton>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </>
  );
};

export default ShiftRotationModal;
