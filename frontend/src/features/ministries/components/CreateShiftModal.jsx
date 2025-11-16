import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

export const CreateShiftModal = ({ open, onClose, ministry, ministryId, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '09:00',
    end_time: '11:00',
    notes: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        notes: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const actualMinistryId = ministry?.id || ministryId;

    if (!actualMinistryId) {
      console.error('Ministry ID is missing');
      showError('Ministry information is missing. Please try again.');
      return;
    }

    if (!formData.date) {
      showError('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ministry: actualMinistryId,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes || '',
      };

      console.log('=== CREATING SHIFT ===');
      console.log('Ministry:', ministry);
      console.log('Payload:', payload);

      const response = await ministriesApi.createShift(payload);
      console.log('Created shift:', response);

      showSuccess('Shift created successfully!');

      // Reset form
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        notes: '',
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('=== CREATE SHIFT ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);

      let errorMsg = 'Failed to create shift';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        } else {
          const firstError = Object.values(errorData)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }

      showError(errorMsg);
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
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        notes: '',
      });
      onClose();
    }
  };

  if (!open) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Shift</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule a new shift for {ministry?.name || 'this ministry'}
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
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={today}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select when this shift will take place
                </p>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={loading}
                  rows={3}
                  placeholder="Any additional information about this shift..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add any special instructions or requirements
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <SecondaryButton
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Shift'}
                </PrimaryButton>
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

export default CreateShiftModal;
