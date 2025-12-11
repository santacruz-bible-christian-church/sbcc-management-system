import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX, HiPlus, HiMinus } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

export const CreateShiftModal = ({ open, onClose, ministry, ministryId, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '09:00',
    end_time: '11:00',
    notes: '',
    quantity: 1,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        notes: '',
        quantity: 1,
      });
    }
  }, [open]);

  const handleQuantityChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(20, prev.quantity + delta))
    }));
  };

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
      const baseShiftData = {
        ministry: actualMinistryId,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes || '',
      };

      // Create multiple shifts with the same details
      const createPromises = Array.from({ length: formData.quantity }, (_, index) => {
        const shiftData = {
          ...baseShiftData,
          notes: formData.notes
            ? `${formData.notes} (Shift ${index + 1}/${formData.quantity})`
            : `Shift ${index + 1}/${formData.quantity}`
        };

        return ministriesApi.createShift(shiftData);
      });

      await Promise.all(createPromises);

      showSuccess(
        `${formData.quantity} shift${formData.quantity > 1 ? 's' : ''} created successfully!`
      );

      // Reset form
      setFormData({
        date: '',
        start_time: '09:00',
        end_time: '11:00',
        notes: '',
        quantity: 1,
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('=== CREATE SHIFT ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);

      let errorMsg = 'Failed to create shift(s)';
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
        quantity: 1,
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
                  Schedule shift(s) for {ministry?.name || 'this ministry'}
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

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Shifts <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={loading || formData.quantity <= 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiMinus className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                      required
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent text-center text-lg font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={loading || formData.quantity >= 20}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiPlus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  How many volunteers are needed for this shift? (1-20)
                </p>

                {formData.quantity > 1 && (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> Creating {formData.quantity} shifts will allow {formData.quantity} different volunteers to serve on the same date and time. Use the "Rotate Shifts" feature to automatically assign volunteers.
                    </p>
                  </div>
                )}
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

              {/* Summary */}
              {formData.date && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>📅 <strong>Date:</strong> {new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</li>
                    <li>⏰ <strong>Time:</strong> {formData.start_time} - {formData.end_time}</li>
                    <li>👥 <strong>Shifts:</strong> {formData.quantity} {formData.quantity === 1 ? 'position' : 'positions'} available</li>
                  </ul>
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
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {loading
                    ? 'Creating...'
                    : formData.quantity > 1
                      ? `Create ${formData.quantity} Shifts`
                      : 'Create Shift'
                  }
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
