import { useEffect } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiX, HiXCircle } from 'react-icons/hi';

const VARIANT_STYLES = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: HiCheckCircle,
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: HiXCircle,
    iconColor: 'text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: HiExclamationCircle,
    iconColor: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: HiInformationCircle,
    iconColor: 'text-blue-600',
  },
};

export const Snackbar = ({ message, variant = 'info', duration = 4000, onClose }) => {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  const Icon = style.icon;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md animate-slide-in-right ${style.bg}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 hover:opacity-70 transition-opacity ${style.text}`}
        aria-label="Close"
      >
        <HiX className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Snackbar;
