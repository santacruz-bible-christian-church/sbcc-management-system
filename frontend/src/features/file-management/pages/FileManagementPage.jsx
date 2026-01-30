import { useState, useCallback, useEffect } from 'react';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { FoldersListView } from '../components/FoldersListView';
import { FilesListView } from '../components/FilesListView';
import { FoldersGridView } from '../components/FoldersGridView';
import { FilesGridView } from '../components/FilesGridView';
import { CollapsibleFoldersView } from '../components/CollapsibleFoldersView';
import { MeetingMinutesModal } from '../components/MeetingMinutesModal';
import { FileManagementSkeleton } from '../components/FileManagementSkeleton';
import { FileManagementToolbar } from '../components/FileManagementToolbar';
import { FileBreadcrumbs } from '../components/FileBreadcrumbs';
import { FileEmptyState } from '../components/FileEmptyState';
import { useMeetingMinutes } from '../hooks/useMeetingMinutes';
import { useFileModals } from '../hooks/useFileModals';
import { useFileNavigation } from '../hooks/useFileNavigation';
import { useFileActions } from '../hooks/useFileActions';
import { useDebounce } from '../../../hooks/useDebounce';

export const FileManagementPage = () => {
  const { canWrite } = usePermissionWarning('documents', { label: 'Documents' });
  const {
    meetings,
    categories,
    loading,
    error,
    setFilters,
    refetch,
    searchMeetings,
    getMeeting,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    uploadAttachment,
    deleteAttachment,
    exportPdf,
    getFolders,
    getFiles,
    getAttachments,
    setSelectedMeeting,
  } = useMeetingMinutes();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  // Custom hooks
  const {
    modalState,
    deleteState,
    saving,
    setSaving,
    openCreateModal,
    openEditModal,
    closeModal,
    setModalMeeting,
    openDeleteModal,
    closeDeleteModal,
  } = useFileModals();

  const {
    currentCategory,
    viewingMeeting,
    breadcrumbs,
    handleFolderClick,
    handleBreadcrumbClick,
    handleFilterChange,
    handleClearFilter,
  } = useFileNavigation({ categories, setFilters, setSelectedMeeting });

  const {
    handleSave,
    handleUploadAttachment,
    handleDeleteAttachmentFromModal,
    handleDeleteConfirm,
    handleFileClick,
    handleFetchVersions,
    handleRestoreVersion,
  } = useFileActions({
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
  });

  // Get display data based on current view
  const folders = currentCategory === null && !viewingMeeting ? getFolders() : [];
  const allFiles = getFiles(); // All files for collapsible view
  const files = viewingMeeting
    ? getAttachments()
    : (currentCategory !== null
        ? getFiles().filter(f => f._original?.category === currentCategory)
        : getFiles());

  // Check if we're at home (no category filter, not viewing a meeting, not searching)
  const isHome = currentCategory === null && !viewingMeeting;

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const isSearching = debouncedSearchTerm.trim().length > 0;

  // Effect to trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      searchMeetings(debouncedSearchTerm);
    } else {
      refetch();
    }
  }, [debouncedSearchTerm, searchMeetings, refetch]);

  // Toggle file selection
  const toggleFileSelection = useCallback((fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMeetings(searchTerm);
    }
  }, [searchTerm, searchMeetings]);

  // Handle file click wrapper
  const onFileClick = useCallback((fileId) => {
    handleFileClick(fileId, files);
  }, [handleFileClick, files]);

  // Handle clear filter wrapper
  const onClearFilter = useCallback(() => {
    setSearchTerm('');
    handleClearFilter(refetch);
  }, [handleClearFilter, refetch]);

  // Handle breadcrumb click wrapper
  const onBreadcrumbClick = useCallback((crumb) => {
    setSearchTerm('');
    handleBreadcrumbClick(crumb);
  }, [handleBreadcrumbClick]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header/Toolbar */}
      <FileManagementToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        categories={categories}
        currentCategory={currentCategory}
        onFilterChange={handleFilterChange}
        onClearFilter={onClearFilter}
        loading={loading}
        onRefresh={refetch}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        onAddNew={canWrite ? openCreateModal : undefined}
        canWrite={canWrite}
      />

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
        <FileBreadcrumbs
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={onBreadcrumbClick}
        />

        {/* Loading State */}
        {loading && meetings.length === 0 && <FileManagementSkeleton />}

        {/* Content */}
        {!loading && (
          <>
            {/* Home View - Collapsible Folders (List mode only, when not searching) */}
            {isHome && !isSearching && viewMode === 'list' && (
              <CollapsibleFoldersView
                folders={folders}
                files={allFiles}
                onFolderClick={handleFolderClick}
                onFileClick={onFileClick}
                onFileDelete={canWrite ? openDeleteModal : undefined}
                onExportPdf={exportPdf}
                canWrite={canWrite}
              />
            )}

            {/* Home View - Grid mode (when not searching) */}
            {isHome && !isSearching && viewMode === 'grid' && (
              <div className="space-y-6">
                <FoldersGridView
                  folders={folders}
                  selectedFiles={selectedFiles}
                  onToggleSelection={toggleFileSelection}
                  onDelete={canWrite ? openDeleteModal : undefined}
                  onFolderClick={handleFolderClick}
                  canWrite={canWrite}
                />
              </div>
            )}

            {/* Category/Attachment View or Search Results */}
            {(!isHome || isSearching) && (
              <>
                {viewMode === 'grid' ? (
                  <div className="space-y-6">
                    <FilesGridView
                      files={files}
                      selectedFiles={selectedFiles}
                      onToggleSelection={toggleFileSelection}
                      onDelete={canWrite ? openDeleteModal : undefined}
                      onFileClick={onFileClick}
                      canWrite={canWrite}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <FilesListView
                      files={files}
                      selectedFiles={selectedFiles}
                      onToggleSelection={toggleFileSelection}
                      onDelete={canWrite ? openDeleteModal : undefined}
                      onFileClick={onFileClick}
                      onExportPdf={exportPdf}
                      canWrite={canWrite}
                    />
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {files.length === 0 && folders.length === 0 && (
              <FileEmptyState
                viewingMeeting={viewingMeeting}
                onCreateNew={canWrite ? openCreateModal : undefined}
                canWrite={canWrite}
              />
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <MeetingMinutesModal
        open={modalState.open}
        meeting={modalState.meeting}
        categories={categories}
        onSave={canWrite ? handleSave : undefined}
        onCancel={closeModal}
        onUploadAttachment={canWrite ? handleUploadAttachment : undefined}
        onDeleteAttachment={canWrite ? handleDeleteAttachmentFromModal : undefined}
        onFetchVersions={handleFetchVersions}
        onRestoreVersion={canWrite ? handleRestoreVersion : undefined}
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
