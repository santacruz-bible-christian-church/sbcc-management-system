import { HiX, HiExclamationCircle } from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';

export function DeleteConfirmModal({ open, onClose, visitor, onConfirm, loading }) {
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
              <div className="p-2 bg-red-100 rounded-full">
                <HiExclamationCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Visitor</h2>
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
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{visitor.full_name}</strong>?
            </p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              This action cannot be undone. All attendance records for this visitor
              will also be deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <SecondaryButton onClick={onClose} disabled={loading}>
              Cancel
            </SecondaryButton>
            <button
              onClick={() => onConfirm(visitor.id)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                'Delete Visitor'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
