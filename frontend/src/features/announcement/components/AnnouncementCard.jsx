import { HiDotsVertical, HiMail, HiPencil, HiTrash, HiEye, HiBan } from 'react-icons/hi';
import { useState, useRef, useEffect } from 'react';
import { formatDateTime, formatRelativeTime } from '../../../utils/format';
import { getAnnouncementStatus, STATUS_CONFIG } from '../utils/constants';

const AnnouncementCard = ({ announcement, onEdit, onDelete, onDeactivate, onSendNow, onPreview }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const status = getAnnouncementStatus(announcement);
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Photo */}
      {announcement.photo && (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={announcement.photo}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              {announcement.sent && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                  <HiMail className="w-3 h-3" />
                  Sent
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
          </div>

          {/* Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <HiDotsVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-10 py-1">
                {/* Preview Recipients */}
                <button
                  onClick={() => { onPreview(announcement); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <HiEye className="w-4 h-4" />
                  Preview Recipients
                </button>

                <div className="border-t my-1" />

                {/* Edit */}
                <button
                  onClick={() => { onEdit(announcement); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <HiPencil className="w-4 h-4" />
                  Edit Announcement
                </button>

                {/* Send Now - only if published and not sent */}
                {!announcement.sent && status === 'published' && announcement.is_active && (
                  <button
                    onClick={() => { onSendNow(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                  >
                    <HiMail className="w-4 h-4" />
                    Send Email Now
                  </button>
                )}

                <div className="border-t my-1" />

                {/* Deactivate - only if active */}
                {announcement.is_active && (
                  <button
                    onClick={() => { onDeactivate(announcement); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                  >
                    <HiBan className="w-4 h-4" />
                    Deactivate
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => { onDelete(announcement); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <HiTrash className="w-4 h-4" />
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
          <span className="font-medium">
            {announcement.audience === 'all' ? 'All Members' : announcement.ministry_name || 'Specific Ministry'}
          </span>
          <span>•</span>
          <span>By {announcement.created_by_name || 'System'}</span>
          <span>•</span>
          <span title={formatDateTime(announcement.publish_at)}>
            {formatRelativeTime(announcement.publish_at)}
          </span>
        </div>

        {/* Body */}
        <p className="text-gray-700 line-clamp-3">{announcement.body}</p>

        {/* Footer */}
        {announcement.expire_at && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            Expires: {formatDateTime(announcement.expire_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;
