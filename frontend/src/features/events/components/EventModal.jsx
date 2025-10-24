import { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import { createPortal } from 'react-dom';

const SIZE_CLASS = {
  xl: 'events-modal__dialog--xl',
  '5xl': 'events-modal__dialog--5xl',
};

export const EventModal = ({ open, title, size, onClose, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="events-modal__overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`events-modal__dialog ${SIZE_CLASS[size] ?? SIZE_CLASS.xl}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="events-modal__header">
          <h2 className="events-modal__title">{title}</h2>
          <button type="button" className="events-modal__close" onClick={onClose}>
            <HiX className="h-5 w-5" />
          </button>
        </header>
        <div className="events-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default EventModal;
