import PropTypes from 'prop-types';
import { HiExclamationCircle, HiX } from 'react-icons/hi';

/**
 * ConfirmationModal - Reusable confirmation dialog
 */
export const ConfirmationModal = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  const getConfirmButtonClasses = () => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    switch (confirmVariant) {
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600`;
      case 'primary':
      default:
        return `${baseClasses} bg-[#FDB54A] text-white hover:bg-[#e5a43b]`;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <HiExclamationCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-gray-700">{message}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={getConfirmButtonClasses()}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

ConfirmationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['primary', 'danger', 'warning']),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ConfirmationModal;
