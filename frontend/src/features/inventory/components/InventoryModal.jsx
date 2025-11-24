import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';
import { SBCC_COLORS } from '../../../store/theme.store';

export const InventoryModal = ({ open, title, onClose, children }) => {
  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ backgroundColor: `${SBCC_COLORS.accent}55` }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-[0_40px_120px_rgba(56,56,56,0.18)]">
        <div className="flex items-center justify-between border-b border-sbcc-gray/20 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-sbcc-dark">{title}</h2>
            <p className="text-sm text-sbcc-gray">Update the inventory details below.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-sbcc-gray transition hover:bg-sbcc-light-orange/60 hover:text-sbcc-dark"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto bg-sbcc-cream px-6 py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InventoryModal;
