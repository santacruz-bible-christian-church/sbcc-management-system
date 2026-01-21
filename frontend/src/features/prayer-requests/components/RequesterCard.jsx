import React from 'react';
import { HiOutlineUser, HiOutlineMail, HiOutlineCalendar } from 'react-icons/hi';
import { formatDistanceToNow, format } from 'date-fns';

// Generate initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate consistent color from name
const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-400';
  const colors = [
    'bg-amber-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const RequesterCard = ({ request }) => {
  const {
    requester_name_display,
    requester_email,
    submitted_at,
    is_anonymous,
  } = request;

  const name = is_anonymous ? 'Anonymous' : requester_name_display || 'Unknown';
  const initials = is_anonymous ? '?' : getInitials(requester_name_display);
  const avatarColor = is_anonymous ? 'bg-gray-400' : getAvatarColor(requester_name_display);

  const relativeTime = submitted_at
    ? formatDistanceToNow(new Date(submitted_at), { addSuffix: true })
    : '';
  const fullDate = submitted_at
    ? format(new Date(submitted_at), 'MMM d, yyyy h:mm a')
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Requester
      </h3>

      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${avatarColor}`}
        >
          {is_anonymous ? (
            <HiOutlineUser className="w-6 h-6" />
          ) : (
            initials
          )}
        </div>

        {/* Name */}
        <div>
          <p className={`font-medium text-gray-900 ${is_anonymous ? 'italic' : ''}`}>
            {name}
          </p>
          {!is_anonymous && requester_email && (
            <p className="text-sm text-gray-500">{requester_email}</p>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        {!is_anonymous && requester_email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiOutlineMail className="w-4 h-4 text-gray-400" />
            <a
              href={`mailto:${requester_email}`}
              className="hover:text-amber-600 transition-colors"
            >
              {requester_email}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
          <span title={fullDate}>Submitted {relativeTime}</span>
        </div>
      </div>
    </div>
  );
};

export default RequesterCard;
