import { useState } from 'react';
import { HiX, HiCheckCircle } from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';

export function CheckInModal({ open, onClose, visitor, onSubmit, loading }) {
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!serviceDate) {
      setError('Please select a service date');
      return;
    }

    try {
      await onSubmit(visitor.id, serviceDate);
      onClose();
    } catch (err) {
      console.error('Error checking in visitor:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to check in visitor'
      );
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!open || !visitor) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdrop}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <HiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Check In Visitor</h2>
                <p className="text-sm text-gray-500">{visitor.full_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Checking in <strong>{visitor.full_name}</strong> will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Record their attendance for the selected date</li>
                <li>Update their visit count</li>
                <li>Auto-update their follow-up status</li>
              </ul>
            </div>

            {/* Service Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <SecondaryButton type="button" onClick={onClose} disabled={loading}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={loading}>
                <HiCheckCircle className="w-4 h-4 mr-1" />
                Check In
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckInModal;
