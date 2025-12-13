// frontend/src/features/announcement/components/DeactivateModal.jsx
import { useState } from 'react';
import { HiX, HiBan, HiExclamation } from 'react-icons/hi';

const DeactivateModal = ({ isOpen, onClose, onConfirm, announcement }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !announcement) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Deactivate Announcement</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 rounded-full p-3">
              <HiBan className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Deactivate this announcement?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              "{announcement.title}"
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HiExclamation className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 text-left">
                  This announcement will no longer be visible on the public homepage
                  and will be marked as inactive. You can reactivate it later by editing.
                </p>
              </div>
            </div>
          </div>

          {/* Announcement Details */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">After Deactivation:</span>
              <span className="font-medium text-gray-600">Inactive</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <HiBan className="w-5 h-5" />
                Deactivate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;
