import { useState, useEffect, useCallback } from 'react';
import { HiFolder, HiDocument, HiPhotograph, HiDocumentText } from 'react-icons/hi';
import { meetingMinutesApi } from '../../../api/meeting-minutes.api';
import { generateMeetingMinutesPDF } from '../utils/meetingMinutesPDF';
import { formatDistanceToNow } from 'date-fns';

// Map file extensions to icons and colors
const getFileIconAndColor = (fileType) => {
  const type = fileType?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
    return { icon: HiPhotograph, color: 'text-blue-500' };
  }
  if (['pdf'].includes(type)) {
    return { icon: HiDocument, color: 'text-red-500' };
  }
  if (['doc', 'docx'].includes(type)) {
    return { icon: HiDocumentText, color: 'text-blue-600' };
  }
  if (['xls', 'xlsx'].includes(type)) {
    return { icon: HiDocument, color: 'text-green-500' };
  }
  return { icon: HiDocument, color: 'text-gray-500' };
};

// Format file size
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 2 : 0)} ${sizes[i]}`;
};

// Transform meeting to file format for display
const transformMeetingToFile = (meeting) => ({
  id: meeting.id,
  name: meeting.title,
  type: meeting.category_display || meeting.category,
  size: `${meeting.attachment_count || 0} attachment${meeting.attachment_count !== 1 ? 's' : ''}`,
  modified: meeting.created_at
    ? formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true })
    : 'Unknown',
  icon: HiDocumentText,
  color: 'text-amber-600',
  // Keep original data for detail view
  _original: meeting,
});

// Transform attachment to file format
const transformAttachment = (attachment) => {
  const { icon, color } = getFileIconAndColor(attachment.file_type);
  return {
    id: `attachment-${attachment.id}`,
    attachmentId: attachment.id,
    name: attachment.file_name,
    type: attachment.file_type?.toUpperCase() || 'File',
    size: formatFileSize(attachment.file_size),
    modified: attachment.uploaded_at
      ? formatDistanceToNow(new Date(attachment.uploaded_at), { addSuffix: true })
      : 'Unknown',
    icon,
    color,
    fileUrl: attachment.file_url,
    _original: attachment,
  };
};

// Transform category to folder format
const transformCategoryToFolder = (category, meetingCount) => ({
  id: category.value,
  name: category.label,
  type: 'Category',
  size: `${meetingCount} meeting${meetingCount !== 1 ? 's' : ''}`,
  modified: '',
  icon: HiFolder,
  color: 'text-yellow-500',
});

export const useMeetingMinutes = () => {
  const [meetings, setMeetings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: null, search: '' });

  // Fetch all meetings
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const data = await meetingMinutesApi.list(params);
      setMeetings(data.results || data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await meetingMinutesApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Search meetings
  const searchMeetings = useCallback(async (query) => {
    try {
      setLoading(true);
      const data = await meetingMinutesApi.search({
        q: query,
        category: filters.category,
        includeAttachments: true
      });
      setMeetings(data);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [filters.category]);

  // Get single meeting with attachments
  const getMeeting = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await meetingMinutesApi.get(id);
      setSelectedMeeting(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch meeting');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create meeting
  const createMeeting = useCallback(async (data) => {
    const newMeeting = await meetingMinutesApi.create(data);
    setMeetings((prev) => [newMeeting, ...prev]);
    return newMeeting;
  }, []);

  // Update meeting
  const updateMeeting = useCallback(async (id, data) => {
    const updated = await meetingMinutesApi.update(id, data);
    setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (selectedMeeting?.id === id) {
      setSelectedMeeting(updated);
    }
    return updated;
  }, [selectedMeeting]);

  // Delete meeting
  const deleteMeeting = useCallback(async (id) => {
    await meetingMinutesApi.delete(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (selectedMeeting?.id === id) {
      setSelectedMeeting(null);
    }
  }, [selectedMeeting]);

  // Upload attachment
  const uploadAttachment = useCallback(async (meetingId, file) => {
    const attachment = await meetingMinutesApi.uploadAttachment(meetingId, file);
    // Refresh the meeting to get updated attachments
    if (selectedMeeting?.id === meetingId) {
      await getMeeting(meetingId);
    }
    return attachment;
  }, [selectedMeeting, getMeeting]);

  // Delete attachment
  const deleteAttachment = useCallback(async (attachmentId) => {
    await meetingMinutesApi.deleteAttachment(attachmentId);
    // Refresh the selected meeting if viewing one
    if (selectedMeeting) {
      await getMeeting(selectedMeeting.id);
    }
  }, [selectedMeeting, getMeeting]);

  // Export meeting as PDF (frontend generation)
  const exportPdf = useCallback(async (meetingId) => {
    try {
      // Fetch full meeting details with attachments
      const fullMeeting = await meetingMinutesApi.get(meetingId);

      // Generate PDF on frontend
      generateMeetingMinutesPDF(fullMeeting);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      throw err;
    }
  }, []);

  // Get folders (categories with meeting counts)
  const getFolders = useCallback(() => {
    const countByCategory = meetings.reduce((acc, meeting) => {
      const cat = meeting.category || 'general';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return categories.map((cat) =>
      transformCategoryToFolder(cat, countByCategory[cat.value] || 0)
    );
  }, [categories, meetings]);

  // Get files (meetings transformed for display)
  const getFiles = useCallback(() => {
    return meetings.map(transformMeetingToFile);
  }, [meetings]);

  // Get attachments for selected meeting
  const getAttachments = useCallback(() => {
    if (!selectedMeeting?.attachments) return [];
    return selectedMeeting.attachments.map(transformAttachment);
  }, [selectedMeeting]);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    // Raw data
    meetings,
    categories,
    selectedMeeting,
    loading,
    error,
    filters,

    // Actions
    setFilters,
    refetch: fetchMeetings,
    searchMeetings,
    getMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    uploadAttachment,
    deleteAttachment,
    exportPdf,
    setSelectedMeeting,

    // Transformed data for UI
    getFolders,
    getFiles,
    getAttachments,

    // Utilities
    transformMeetingToFile,
    transformAttachment,
  };
};
