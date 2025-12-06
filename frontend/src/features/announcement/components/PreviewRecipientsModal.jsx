import { HiX, HiUsers, HiMail } from 'react-icons/hi';

const PreviewRecipientsModal = ({ isOpen, onClose, recipientData, announcement }) => {
  if (!isOpen || !recipientData) return null;

  const { count, audience, ministry, sample_emails } = recipientData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Email Recipients Preview</h2>
            <p className="text-sm text-gray-500 mt-1">{announcement?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <HiUsers className="w-5 h-5" />
                <span className="text-sm font-medium">Total Recipients</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{count}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <HiMail className="w-5 h-5" />
                <span className="text-sm font-medium">Audience</span>
              </div>
              <p className="text-sm font-bold text-orange-700">
                {ministry || audience}
              </p>
            </div>
          </div>

          {/* Sample Emails */}
          {sample_emails && sample_emails.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Sample Recipients:
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {sample_emails.map((email, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <HiMail className="w-4 h-4 text-gray-400" />
                      {email}
                    </li>
                  ))}
                </ul>
                {count > sample_emails.length && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    + {count - sample_emails.length} more recipients
                  </p>
                )}
              </div>
            </div>
          )}

          {count === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recipients found for this announcement.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewRecipientsModal;
