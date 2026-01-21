import React, { useState } from 'react';
import {
  HiOutlineAnnotation,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineHome,
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';
import { formatDistanceToNow, format } from 'date-fns';

// Action type configuration
const ACTION_TYPES = {
  created: {
    icon: HiOutlinePlus,
    label: 'Created',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  note: {
    icon: HiOutlineAnnotation,
    label: 'Note',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  call: {
    icon: HiOutlinePhone,
    label: 'Phone Call',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  email: {
    icon: HiOutlineMail,
    label: 'Email',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
  visit: {
    icon: HiOutlineHome,
    label: 'Visit',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
  assigned: {
    icon: HiOutlineUserAdd,
    label: 'Assigned',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  completed: {
    icon: HiOutlineCheckCircle,
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
};

// Single timeline item
const TimelineItem = ({ item, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_TYPES[item.type] || ACTION_TYPES.note;
  const Icon = config.icon;

  const hasLongContent = item.content && item.content.length > 150;
  const displayContent = hasLongContent && !expanded
    ? item.content.slice(0, 150) + '...'
    : item.content;

  const relativeTime = item.date
    ? formatDistanceToNow(new Date(item.date), { addSuffix: true })
    : '';
  const fullDate = item.date
    ? format(new Date(item.date), 'MMM d, yyyy h:mm a')
    : '';

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div
        className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 ${config.bgColor} ${config.borderColor}`}
      >
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400" title={fullDate}>
            {relativeTime}
          </span>
        </div>

        {item.content && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {displayContent}
            </p>
            {hasLongContent && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <HiOutlineChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <HiOutlineChevronDown className="w-3 h-3" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {item.author && (
          <p className="text-xs text-gray-400 mt-1.5">
            by {item.author}
          </p>
        )}
      </div>
    </div>
  );
};

// Build timeline from request data
const buildTimeline = (request) => {
  const timeline = [];

  // Created event
  if (request.submitted_at) {
    timeline.push({
      type: 'created',
      date: request.submitted_at,
      content: null,
      author: request.is_anonymous ? 'Anonymous' : request.requester_name_display,
    });
  }

  // Follow-ups
  if (request.follow_ups) {
    request.follow_ups.forEach((fu) => {
      timeline.push({
        type: fu.action_type || 'note',
        date: fu.created_at,
        content: fu.notes,
        author: fu.created_by_name,
      });
    });
  }

  // Completed event
  if (request.status === 'completed' && request.completed_at) {
    timeline.push({
      type: 'completed',
      date: request.completed_at,
      content: null,
      author: request.completed_by_name,
    });
  }

  // Sort by date descending (newest first)
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

  return timeline;
};

// Main component
const ActivityTimeline = ({ request }) => {
  const timeline = buildTimeline(request);

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {timeline.map((item, index) => (
        <TimelineItem
          key={`${item.type}-${item.date}-${index}`}
          item={item}
          isLast={index === timeline.length - 1}
        />
      ))}
    </div>
  );
};

export default ActivityTimeline;
