import { useState, useEffect, useRef } from 'react';
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
  const [processingTime, setProcessingTime] = useState(0);
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    days: 7,
    notify: false,
    dry_run: true,
    limit_per_ministry: 0,
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setProcessingTime(0);
    timerRef.current = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setTimeoutWarning(false);
    startTimer();

    // Show processing indicator for large operations
    const estimatedShifts = Math.ceil(formData.days / 7) * 4; // Rough estimate
    const isLargeOperation = estimatedShifts > 20 || formData.days > 30;

    if (isLargeOperation) {
      showWarning(`Processing ${estimatedShifts}+ shifts... This may take up to 2 minutes.`);
    }

    try {
      console.log('=== ROTATING SHIFTS ===');
      console.log('Ministry:', ministry.name);
      console.log('Params:', formData);

      const response = await ministriesApi.rotateShifts(ministry.id, formData);

      console.log(`Rotation completed in ${processingTime}s`);
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
          'Request timed out. The operation may still be processing. Please refresh the page in a moment to check if assignments were created.'
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
      stopTimer();
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setFormData({ ...formData, dry_run: false });
    setLoading(true);
    setTimeoutWarning(false);
    startTimer();

    try {
      const response = await ministriesApi.rotateShifts(ministry.id, {
        ...formData,
        dry_run: false,
      });

      console.log(`Confirmation completed in ${processingTime}s`);

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
          'Request timed out. The assignments may still be creating. Please wait a moment and refresh.'
        );
      } else if (err.response?.status >= 500) {
        showError(
          'Server error during confirmation. Please refresh and check if assignments were created.'
        );
      } else {
        showError(err.response?.data?.detail || 'Failed to create assignments');
      }
    } finally {
      stopTimer();
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
      stopTimer();
      setResult(null);
      setTimeoutWarning(false);
      setProcessingTime(0);
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
              {/* Processing Indicator */}
              {loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-sbcc-primary border-t-transparent"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Processing assignment rotation...
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Elapsed time: {processingTime}s
                        {processingTime > 10 && processingTime < 30 && " - Large operations may take up to 2 minutes"}
                        {processingTime >= 30 && " - Still processing, please wait..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeout Warning */}
              {timeoutWarning && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HiClock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">Operation May Still Be Processing</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        The request timed out after {processingTime}s, but the assignments may still be creating in the background.
                        Please wait 30 seconds and refresh the shifts to check.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTimeoutWarning(false);
                          if (onSuccess) onSuccess();
                        }}
                        className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
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
                  max="90"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Number of days ahead to assign shifts (recommended: 7-30 days)
                  {formData.days > 30 && (
                    <span className="block text-yellow-600 mt-1 font-medium">
                      ⚠️ Large date ranges ({formData.days} days) may take 30-120 seconds to process
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
                  Limit the number of shifts to assign (helps reduce processing time)
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
                    <span className="block text-xs text-yellow-600 mt-0.5">
                      ⚠️ Email sending significantly increases processing time (2-3s per email)
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
                        <span className="text-xs text-blue-700 ml-2">
                          (Completed in {processingTime}s)
                        </span>
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
                    {loading ? `Previewing... (${processingTime}s)` : 'Preview Assignments'}
                  </PrimaryButton>
                )}

                {formData.dry_run && result && result.created > 0 && (
                  <PrimaryButton
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? `Creating... (${processingTime}s)` : `Confirm & Create ${result.created} Assignments`}
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
