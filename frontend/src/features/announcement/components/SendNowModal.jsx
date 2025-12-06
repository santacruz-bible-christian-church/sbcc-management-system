import { useState } from 'react';
import { HiX, HiMail, HiExclamation } from 'react-icons/hi';

const SendNowModal = ({ isOpen, onClose, onConfirm, announcement }) => {
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
          <h2 className="text-xl font-bold">Send Email Notification</h2>
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
            <div className="bg-blue-100 rounded-full p-3">
              <HiMail className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Send Announcement Now?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              "{announcement.title}"
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <HiExclamation className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 text-left">
                  This will send email notifications to all recipients in the target audience.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Announcement Details */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Audience:</span>
              <span className="font-medium">
                {announcement.audience === 'all' ? 'All Members' : announcement.ministry_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">
                {announcement.sent ? 'Already Sent' : 'Not Sent'}
              </span>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <HiMail className="w-5 h-5" />
                Send Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendNowModal;
