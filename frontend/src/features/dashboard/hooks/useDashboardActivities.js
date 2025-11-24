import { useMemo } from 'react';
import {
  HiUsers,
  HiCalendar,
  HiClipboardList,
  HiSparkles
} from 'react-icons/hi';

export const useDashboardActivities = (stats) => {
  return useMemo(() => {
    if (!stats) return [];

    const activities = [];

    // Add recent members
    if (stats?.recent_members?.length > 0) {
      stats.recent_members.slice(0, 2).forEach(member => {
        activities.push({
          title: 'New Member Added',
          description: `${member.first_name} ${member.last_name} joined the congregation`,
          time: formatTimeAgo(member.created_at),
          icon: HiUsers,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          link: '/members'
        });
      });
    }

    // Add recent events
    if (stats?.recent_events?.length > 0) {
      stats.recent_events.slice(0, 2).forEach(event => {
        activities.push({
          title: 'Event Scheduled',
          description: event.title,
          time: formatTimeAgo(event.created_at),
          icon: HiCalendar,
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          link: '/events'
        });
      });
    }

    // Add attendance activities
    if (stats?.recent_attendance?.length > 0) {
      stats.recent_attendance.slice(0, 1).forEach(attendance => {
        activities.push({
          title: 'Attendance Recorded',
          description: `${attendance.event_title} - ${attendance.attendance_rate}% attendance`,
          time: formatTimeAgo(attendance.created_at),
          icon: HiClipboardList,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          link: '/attendance'
        });
      });
    }

    // Fallback if no activities
    if (activities.length === 0) {
      activities.push({
        title: 'Welcome!',
        description: 'Start by adding members or creating events',
        time: 'Just now',
        icon: HiSparkles,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        link: null
      });
    }

    return activities.slice(0, 5);
  }, [stats]);
};

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recently';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
