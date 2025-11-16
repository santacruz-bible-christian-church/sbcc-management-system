import { useState } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

export const ShiftRotationModal = ({ open, onClose, ministry, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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

    try {
      console.log('=== ROTATING SHIFTS ===');
      console.log('Ministry:', ministry.name);
      console.log('Params:', formData);

      const response = await ministriesApi.rotateShifts(ministry.id, formData);
      console.log('Rotation result:', response);

      setResult(response);

      if (formData.dry_run) {
        showSuccess(`Preview: ${response.created} assignments would be created`);
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
    } catch (err) {
      console.error('Rotation error:', err);
      showError(err.response?.data?.detail || 'Failed to rotate shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setFormData({ ...formData, dry_run: false });
    setLoading(true);

    try {
      const response = await ministriesApi.rotateShifts(ministry.id, {
        ...formData,
        dry_run: false,
      });

      setResult(response);
      showSuccess(
        `Successfully created ${response.created} assignments!${
          response.emailed > 0 ? ` ${response.emailed} emails sent.` : ''
        }`
      );

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after successful confirmation
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create assignments');
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Number of days ahead to assign shifts (default: 7)
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
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
                  className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary"
                />
                <label htmlFor="notify" className="text-sm font-medium text-gray-700">
                  Send email notifications to assigned volunteers
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HiExclamationCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Errors:</p>
                      <ul className="mt-2 space-y-1 text-sm text-red-800">
                        {result.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
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
                  Cancel
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
