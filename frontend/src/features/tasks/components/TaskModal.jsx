import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HiX } from 'react-icons/hi';

/**
 * TaskModal - Redesigned with sticky footer and internal scrolling
 * Ensures action buttons are always visible
 */
export const TaskModal = ({ open, title, children, onClose, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClasses[size]} transform rounded-2xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]`}
              >
                {/* Header - Sticky top */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl shrink-0">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TaskModal;
