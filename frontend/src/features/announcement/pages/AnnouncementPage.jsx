import { useState, useMemo } from 'react';
import { HiPlus } from 'react-icons/hi';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
import StatsCards from '../components/StatsCards';
import AnnouncementFilters from '../components/AnnouncementFilters';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementSkeleton from '../components/AnnouncementSkeleton';
import AnnouncementModal from '../components/AnnouncementModal';
import PreviewRecipientsModal from '../components/PreviewRecipientsModal';
import SendNowModal from '../components/SendNowModal';
import DeactivateModal from '../components/DeactivateModal';
import { getAnnouncementStatus } from '../utils/constants';
import { showSuccess, showError } from '../../../utils/toast';

const AnnouncementPage = () => {
  const { canWrite } = usePermissionWarning('announcements', { label: 'Announcements' });
  const {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    sendNow,
    previewRecipients,
  } = useAnnouncements();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, data: null, announcement: null });
  const [sendNowModal, setSendNowModal] = useState({ isOpen: false, announcement: null });
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, announcement: null });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filtered announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        searchQuery === '' ||
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAudience =
        audienceFilter === '' || announcement.audience === audienceFilter;

      const matchesStatus =
        statusFilter === '' || getAnnouncementStatus(announcement) === statusFilter;

      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [announcements, searchQuery, audienceFilter, statusFilter]);

  // Handlers
  const handleCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setIsSubmittingAnnouncement(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data);
      } else {
        await createAnnouncement(data);
      }
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      showError('Failed to save announcement. Please try again.');
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };

  const handleDelete = async (announcement) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      try {
        await deleteAnnouncement(announcement.id);
      } catch (error) {
        console.error('Error deleting announcement:', error);
        showError('Failed to delete announcement. Please try again.');
      }
    }
  };

  const handlePreview = async (announcement) => {
    try {
      const result = await previewRecipients(announcement.id);
      setPreviewModal({ isOpen: true, data: result, announcement });
    } catch (error) {
      console.error('Error previewing recipients:', error);
      showError('Failed to load recipients. Please try again.');
    }
  };

  const handleSendNowClick = (announcement) => {
    setSendNowModal({ isOpen: true, announcement });
  };

  const handleSendNowConfirm = async () => {
    try {
      const result = await sendNow(sendNowModal.announcement.id);
      setSendNowModal({ isOpen: false, announcement: null });

      // Success notification
      showSuccess(`Announcement sent! ${result.emails_sent} email(s) delivered.`);
    } catch (error) {
      console.error('Error sending announcement:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send notifications.';
      showError(errorMsg);
      setSendNowModal({ isOpen: false, announcement: null });
    }
  };

  const handleDeactivateClick = (announcement) => {
    setDeactivateModal({ isOpen: true, announcement });
  };

  const handleDeactivateConfirm = async () => {
    try {
      await updateAnnouncement(deactivateModal.announcement.id, { is_active: false });
      setDeactivateModal({ isOpen: false, announcement: null });
    } catch (error) {
      console.error('Error deactivating announcement:', error);
      showError('Failed to deactivate announcement. Please try again.');
      setDeactivateModal({ isOpen: false, announcement: null });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Unified Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm mb-4">
          <StatsCards announcements={announcements} inline />
          {canWrite && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] font-medium whitespace-nowrap"
            >
              <HiPlus className="w-5 h-5" />
              New Announcement
            </button>
          )}
        </div>

        {/* Filters */}
        <AnnouncementFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          audienceFilter={audienceFilter}
          setAudienceFilter={setAudienceFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Content */}
        {loading ? (
          <AnnouncementSkeleton />
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-red-500">Error loading announcements: {error.message}</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">
              {searchQuery || audienceFilter || statusFilter
                ? 'No announcements match your filters.'
                : 'No announcements yet. Create your first announcement!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={canWrite ? handleEdit : undefined}
                onDelete={canWrite ? handleDelete : undefined}
                onDeactivate={canWrite ? handleDeactivateClick : undefined}
                onSendNow={canWrite ? handleSendNowClick : undefined}
                onPreview={handlePreview}
                canWrite={canWrite}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAnnouncement(null);
          }}
          onSubmit={handleSubmit}
          announcement={editingAnnouncement}
          submitting={isSubmittingAnnouncement}
        />

        <PreviewRecipientsModal
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, data: null, announcement: null })}
          recipientData={previewModal.data}
          announcement={previewModal.announcement}
        />

        <SendNowModal
          isOpen={sendNowModal.isOpen}
          onClose={() => setSendNowModal({ isOpen: false, announcement: null })}
          onConfirm={handleSendNowConfirm}
          announcement={sendNowModal.announcement}
        />

        <DeactivateModal
          isOpen={deactivateModal.isOpen}
          onClose={() => setDeactivateModal({ isOpen: false, announcement: null })}
          onConfirm={handleDeactivateConfirm}
          announcement={deactivateModal.announcement}
        />
      </div>
    </main>
  );
};

export default AnnouncementPage;
