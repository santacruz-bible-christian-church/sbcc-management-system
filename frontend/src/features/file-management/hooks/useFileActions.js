import { useCallback } from 'react';
import { meetingMinutesApi } from '../../../api/meeting-minutes.api';

/**
 * Hook for file management action handlers
 */
export const useFileActions = ({
  createMeeting,
  updateMeeting,
  deleteMeeting,
  uploadAttachment,
  deleteAttachment,
  getMeeting,
  refetch,
  closeModal,
  closeDeleteModal,
  setModalMeeting,
  setSaving,
  modalState,
  deleteState,
  openEditModal,
}) => {
  // Handle save (create or update)
  const handleSave = useCallback(async (formData) => {
    try {
      setSaving(true);
      if (modalState.meeting) {
        await updateMeeting(modalState.meeting.id, formData);
      } else {
        await createMeeting(formData);
      }
      closeModal();
      refetch();
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [modalState.meeting, createMeeting, updateMeeting, closeModal, refetch, setSaving]);

  // Handle upload attachment (from modal)
  const handleUploadAttachment = useCallback(async (meetingId, file) => {
    try {
      await uploadAttachment(meetingId, file);
      const updated = await getMeeting(meetingId);
      setModalMeeting(updated);
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  }, [uploadAttachment, getMeeting, setModalMeeting]);

  // Handle delete attachment (from modal)
  const handleDeleteAttachmentFromModal = useCallback(async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      if (modalState.meeting) {
        const updated = await getMeeting(modalState.meeting.id);
        setModalMeeting(updated);
      }
    } catch (err) {
      console.error('Delete attachment error:', err);
    }
  }, [deleteAttachment, getMeeting, modalState.meeting, setModalMeeting]);

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.item) return;

    try {
      if (deleteState.type === 'attachment') {
        await deleteAttachment(deleteState.item.attachmentId);
      } else {
        await deleteMeeting(deleteState.item.id);
      }
      closeDeleteModal();
      refetch();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [deleteState, deleteAttachment, deleteMeeting, closeDeleteModal, refetch]);

  // Handle file click
  const handleFileClick = useCallback(async (fileId, files) => {
    const file = files.find(f => f.id === fileId);
    if (file?.attachmentId) {
      if (file.fileUrl) {
        window.open(file.fileUrl, '_blank');
      }
      return;
    }

    const meeting = await getMeeting(fileId);
    if (meeting) {
      openEditModal(meeting);
    }
  }, [getMeeting, openEditModal]);

  // Fetch versions for a meeting
  const handleFetchVersions = useCallback(async (meetingId) => {
    try {
      return await meetingMinutesApi.getVersions(meetingId);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
      return [];
    }
  }, []);

  // Restore a version
  const handleRestoreVersion = useCallback(async (meetingId, versionNumber) => {
    try {
      const restored = await meetingMinutesApi.restoreVersion(meetingId, versionNumber);
      const updated = await getMeeting(meetingId);
      setModalMeeting(updated);
      return restored;
    } catch (err) {
      console.error('Failed to restore version:', err);
      throw err;
    }
  }, [getMeeting, setModalMeeting]);

  return {
    handleSave,
    handleUploadAttachment,
    handleDeleteAttachmentFromModal,
    handleDeleteConfirm,
    handleFileClick,
    handleFetchVersions,
    handleRestoreVersion,
  };
};

export default useFileActions;
