import { Modal } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { PrimaryButton, SecondaryButton, Button } from './Button';

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
  return (
    <Modal show={open} onClose={onCancel} size="md">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <HiExclamationCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex gap-3 justify-end w-full">
          <SecondaryButton onClick={onCancel} disabled={loading}>
            {cancelText}
          </SecondaryButton>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
