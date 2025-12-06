import { useState, useMemo } from 'react';
import { HiPlus } from 'react-icons/hi';
import { useAnnouncements } from '../hooks/useAnnouncements';
import StatsCards from '../components/StatsCards';
import AnnouncementFilters from '../components/AnnouncementFilters';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import PreviewRecipientsModal from '../components/PreviewRecipientsModal';
import SendNowModal from '../components/SendNowModal';
import DeactivateModal from '../components/DeactivateModal';
import { getAnnouncementStatus } from '../utils/constants';

const AnnouncementPage = () => {
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

  // Action modals
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
      alert('Failed to save announcement. Please try again.');
    }
  };

  const handleDelete = async (announcement) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      try {
        await deleteAnnouncement(announcement.id);
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement. Please try again.');
      }
    }
  };

  const handlePreview = async (announcement) => {
    try {
      const result = await previewRecipients(announcement.id);
      setPreviewModal({ isOpen: true, data: result, announcement });
    } catch (error) {
      console.error('Error previewing recipients:', error);
      alert('Failed to load recipients. Please try again.');
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
      alert(
        `✅ ${result.message}\n\n` +
        `Recipients: ${result.recipients}\n` +
        `Successfully sent: ${result.sent}`
      );
    } catch (error) {
      console.error('Error sending announcement:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send notifications.';
      alert(`❌ ${errorMsg}`);
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
      alert('Failed to deactivate announcement. Please try again.');
      setDeactivateModal({ isOpen: false, announcement: null });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Pages</p>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6C67E] font-medium shadow"
          >
            <HiPlus className="w-5 h-5" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards announcements={announcements} />

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
        <div className="text-center py-12">
          <p className="text-gray-500">Loading announcements...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading announcements: {error.message}</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeactivate={handleDeactivateClick}
              onSendNow={handleSendNowClick}
              onPreview={handlePreview}
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
  );
};

export default AnnouncementPage;
