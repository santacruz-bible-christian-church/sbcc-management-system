import { useState, useCallback } from 'react';
import {
  HiSearch,
  HiFilter,
  HiPlus,
  HiViewGrid,
  HiViewList,
  HiHome,
  HiChevronRight,
  HiFolder,
  HiRefresh,
  HiUpload,
} from 'react-icons/hi';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { FoldersListView } from '../components/FoldersListView';
import { FilesListView } from '../components/FilesListView';
import { FoldersGridView } from '../components/FoldersGridView';
import { FilesGridView } from '../components/FilesGridView';
import { MeetingMinutesModal } from '../components/MeetingMinutesModal';
import { useMeetingMinutes } from '../hooks/useMeetingMinutes';
import { meetingMinutesApi } from '../../../api/meeting-minutes.api';

export const FileManagementPage = () => {
  const {
    meetings,
    categories,
    selectedMeeting,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    searchMeetings,
    getMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    uploadAttachment,
    deleteAttachment,
    getFolders,
    getFiles,
    getAttachments,
    setSelectedMeeting,
  } = useMeetingMinutes();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteState, setDeleteState] = useState({ open: false, item: null, type: null });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Meeting Minutes' }]);

  // Modal states
  const [modalState, setModalState] = useState({ open: false, meeting: null });
  const [saving, setSaving] = useState(false);

  // Get display data based on current view
  const folders = currentCategory === null && !viewingMeeting ? getFolders() : [];
  const files = viewingMeeting
    ? getAttachments()
    : (currentCategory !== null
        ? getFiles().filter(f => f._original?.category === currentCategory)
        : getFiles());

  // Open modal for create/edit
  const openCreateModal = useCallback(() => {
    setModalState({ open: true, meeting: null });
  }, []);

  const openEditModal = useCallback((meeting) => {
    setModalState({ open: true, meeting });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ open: false, meeting: null });
  }, []);

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
  }, [modalState.meeting, createMeeting, updateMeeting, closeModal, refetch]);

  // Handle upload attachment (from modal)
  const handleUploadAttachment = useCallback(async (meetingId, file) => {
    try {
      await uploadAttachment(meetingId, file);
      // Refresh the meeting to show new attachment
      const updated = await getMeeting(meetingId);
      setModalState((prev) => ({ ...prev, meeting: updated }));
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  }, [uploadAttachment, getMeeting]);

  // Handle delete attachment (from modal)
  const handleDeleteAttachmentFromModal = useCallback(async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      // Refresh the meeting
      if (modalState.meeting) {
        const updated = await getMeeting(modalState.meeting.id);
        setModalState((prev) => ({ ...prev, meeting: updated }));
      }
    } catch (err) {
      console.error('Delete attachment error:', err);
    }
  }, [deleteAttachment, getMeeting, modalState.meeting]);

  // Handle category (folder) click
  const handleFolderClick = useCallback((categoryId) => {
    const category = categories.find((c) => c.value === categoryId);
    if (category) {
      setCurrentCategory(categoryId);
      setFilters((prev) => ({ ...prev, category: categoryId }));
      setBreadcrumbs((prev) => [...prev, { id: categoryId, name: category.label, type: 'category' }]);
    }
  }, [categories, setFilters]);

  // Handle meeting (file) click - open edit modal with meeting details
  const handleFileClick = useCallback(async (fileId) => {
    // Check if it's an attachment
    const file = files.find(f => f.id === fileId);
    if (file?.attachmentId) {
      // It's an attachment - download or preview
      if (file.fileUrl) {
        window.open(file.fileUrl, '_blank');
      }
      return;
    }

    // It's a meeting - load full data and open edit modal
    const meeting = await getMeeting(fileId);
    if (meeting) {
      openEditModal(meeting);
    }
  }, [files, getMeeting, openEditModal]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((crumb) => {
    const index = breadcrumbs.findIndex((b) => b.id === crumb.id);
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);

    if (crumb.id === null) {
      setCurrentCategory(null);
      setViewingMeeting(false);
      setSelectedMeeting(null);
      setFilters((prev) => ({ ...prev, category: null }));
    } else if (crumb.type === 'category') {
      setCurrentCategory(crumb.id);
      setViewingMeeting(false);
      setSelectedMeeting(null);
      setFilters((prev) => ({ ...prev, category: crumb.id }));
    }
  }, [breadcrumbs, setFilters, setSelectedMeeting]);

  // Handle search
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMeetings(searchTerm);
    } else {
      refetch();
    }
  }, [searchTerm, searchMeetings, refetch]);

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    const value = e.target.value;
    if (value) {
      handleFolderClick(value);
    } else {
      setCurrentCategory(null);
      setFilters((prev) => ({ ...prev, category: null }));
      setBreadcrumbs([{ id: null, name: 'Meeting Minutes' }]);
    }
  }, [handleFolderClick, setFilters]);

  // Handle clear filter
  const handleClearFilter = useCallback(() => {
    setCurrentCategory(null);
    setSearchTerm('');
    setFilters({ category: null, search: '' });
    setBreadcrumbs([{ id: null, name: 'Meeting Minutes' }]);
    setViewingMeeting(false);
    setSelectedMeeting(null);
    refetch();
  }, [setFilters, setSelectedMeeting, refetch]);

  // Toggle file selection
  const toggleFileSelection = useCallback((fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  }, []);

  // Delete handlers
  const openDeleteModal = useCallback((item) => {
    // Don't allow deleting folders (categories)
    if (item.type === 'Category') return;

    const type = item.attachmentId ? 'attachment' : 'meeting';
    setDeleteState({ open: true, item, type });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, item: null, type: null });
  }, []);

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
      // Refresh the meeting data
      const updated = await getMeeting(meetingId);
      setModalState((prev) => ({ ...prev, meeting: updated }));
      return restored;
    } catch (err) {
      console.error('Failed to restore version:', err);
      throw err;
    }
  }, [getMeeting]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-transparent border-b border-gray-200">
        <div className="px-8 py-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Meeting Minutes</h1>

          {/* Search and Actions Bar */}
          <div className="flex items-stretch gap-3 h-12">
            {/* Add Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center aspect-square h-full bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6A635] transition-colors flex-shrink-0"
              title="Add new meeting minutes"
            >
              <HiPlus className="w-6 h-6" />
            </button>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 h-full">
              <div className="pl-3 pr-2">
                <HiSearch className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search meeting minutes..."
                className="flex-1 h-full px-2 outline-none text-sm text-gray-700 border-0"
              />
              <button
                type="submit"
                className="bg-[#FDB54A] text-white px-6 h-full text-sm font-medium hover:bg-[#e5a43b] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Filter Dropdown */}
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex-shrink-0 h-full">
              <div className="flex items-center justify-center px-3">
                <HiFilter className="w-5 h-5 text-[#FDB54A]" />
              </div>
              <select
                value={currentCategory || ''}
                onChange={handleFilterChange}
                className="bg-transparent px-4 h-full text-sm text-gray-600 outline-none border-0 min-w-[140px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleClearFilter}
                className="px-4 h-full bg-[#FDB54A] text-white text-sm font-medium hover:bg-[#e5a43b] transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center justify-center h-full px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm disabled:opacity-50"
              title="Refresh"
            >
              <HiRefresh className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* View Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flex items-center justify-center h-full px-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 shadow-sm"
              title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? (
                <HiViewList className="w-5 h-5 text-gray-700" />
              ) : (
                <HiViewGrid className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={refetch} className="ml-2 underline">Try again</button>
          </div>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <HiChevronRight className="w-4 h-4 text-gray-400" />}
              <button
                onClick={() => handleBreadcrumbClick(crumb)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 font-medium bg-gray-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {index === 0 && <HiHome className="w-4 h-4" />}
                {crumb.name}
              </button>
            </div>
          ))}
        </nav>

        {/* Loading State */}
        {loading && meetings.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDB54A]"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {viewMode === 'grid' ? (
              <div className="space-y-6">
                <FoldersGridView
                  folders={folders}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDelete={openDeleteModal}
                  onFolderClick={handleFolderClick}
                />
                <FilesGridView
                  files={files}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDelete={openDeleteModal}
                  onFileClick={handleFileClick}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <FoldersListView
                  folders={folders}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDelete={openDeleteModal}
                  onFolderClick={handleFolderClick}
                />
                <FilesListView
                  files={files}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDelete={openDeleteModal}
                  onFileClick={handleFileClick}
                />
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && folders.length === 0 && (
              <div className="text-center py-12">
                <HiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {viewingMeeting ? 'No attachments' : 'No meeting minutes yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {viewingMeeting
                    ? 'Upload files to this meeting record'
                    : 'Create your first meeting minutes to get started'
                  }
                </p>
                <button
                  onClick={viewingMeeting ? undefined : openCreateModal}
                  className="px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6A635] transition-colors"
                >
                  {viewingMeeting ? 'Upload File' : 'Create Meeting Minutes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <MeetingMinutesModal
        open={modalState.open}
        meeting={modalState.meeting}
        categories={categories}
        onSave={handleSave}
        onCancel={closeModal}
        onUploadAttachment={handleUploadAttachment}
        onDeleteAttachment={handleDeleteAttachmentFromModal}
        onFetchVersions={handleFetchVersions}
        onRestoreVersion={handleRestoreVersion}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteState.open}
        title={deleteState.type === 'attachment' ? 'Delete Attachment?' : 'Delete Meeting Minutes?'}
        message={`Are you sure you want to delete "${deleteState.item?.name}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default FileManagementPage;
