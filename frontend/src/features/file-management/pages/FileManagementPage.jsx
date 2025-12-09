import { useState, useCallback } from 'react';
import {
  HiSearch,
  HiFilter,
  HiDotsVertical,
  HiDownload,
  HiTrash,
  HiEye,
  HiFolder,
  HiDocument,
  HiPhotograph,
  HiChevronDown,
  HiPlus,
  HiViewGrid,
  HiViewList,
  HiHome,
  HiChevronRight,
} from 'react-icons/hi';
import { ConfirmationModal } from '../../../components/ui/Modal';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { FoldersListView } from '../components/FoldersListView';
import { FilesListView } from '../components/FilesListView';
import { FoldersGridView } from '../components/FoldersGridView';
import { FilesGridView } from '../components/FilesGridView';

export const FileManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteState, setDeleteState] = useState({ open: false, file: null });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Documents' }]);

  // Sample folders data with nested files
  const allFolders = [
    {
      id: 'f1',
      name: 'Sunday Service Photos',
      type: 'Folder',
      size: '45 items',
      modified: '3 days ago',
      icon: HiFolder,
      color: 'text-yellow-500',
      files: [
        {
          id: 'f1-1',
          name: 'Service_Photo_001.jpg',
          type: 'Image',
          size: '3.2 MB',
          modified: '3 days ago',
          icon: HiPhotograph,
          color: 'text-blue-500',
        },
        {
          id: 'f1-2',
          name: 'Service_Photo_002.jpg',
          type: 'Image',
          size: '2.8 MB',
          modified: '3 days ago',
          icon: HiPhotograph,
          color: 'text-blue-500',
        },
      ],
    },
    {
      id: 'f2',
      name: 'Ministry Documents',
      type: 'Folder',
      size: '23 items',
      modified: '1 week ago',
      icon: HiFolder,
      color: 'text-yellow-500',
      files: [
        {
          id: 'f2-1',
          name: 'Ministry Guidelines.pdf',
          type: 'PDF',
          size: '1.5 MB',
          modified: '1 week ago',
          icon: HiDocument,
          color: 'text-red-500',
        },
        {
          id: 'f2-2',
          name: 'Volunteer List.xlsx',
          type: 'Excel',
          size: '456 KB',
          modified: '1 week ago',
          icon: HiDocument,
          color: 'text-green-500',
        },
      ],
    },
    {
      id: 'f3',
      name: 'Event Planning',
      type: 'Folder',
      size: '18 items',
      modified: '2 weeks ago',
      icon: HiFolder,
      color: 'text-yellow-500',
      files: [
        {
          id: 'f3-1',
          name: 'Event Checklist.docx',
          type: 'Word',
          size: '245 KB',
          modified: '2 weeks ago',
          icon: HiDocument,
          color: 'text-blue-600',
        },
        {
          id: 'f3-2',
          name: 'Budget Plan.xlsx',
          type: 'Excel',
          size: '678 KB',
          modified: '2 weeks ago',
          icon: HiDocument,
          color: 'text-green-500',
        },
      ],
    },
  ];

  // Root level files
  const rootFiles = [
    {
      id: 1,
      name: 'Annual Report 2024.pdf',
      type: 'PDF',
      size: '2.4 MB',
      modified: '2 hours ago',
      icon: HiDocument,
      color: 'text-red-500',
    },
    {
      id: 2,
      name: 'Church Budget.xlsx',
      type: 'Excel',
      size: '856 KB',
      modified: 'Yesterday',
      icon: HiDocument,
      color: 'text-green-500',
    },
    {
      id: 4,
      name: 'Event Flyer.png',
      type: 'Image',
      size: '1.2 MB',
      modified: '1 week ago',
      icon: HiPhotograph,
      color: 'text-blue-500',
    },
    {
      id: 5,
      name: 'Meeting Minutes.docx',
      type: 'Word',
      size: '124 KB',
      modified: '2 weeks ago',
      icon: HiDocument,
      color: 'text-blue-600',
    },
  ];

  // Get current view based on folder navigation
  const currentFolder = allFolders.find((f) => f.id === currentFolderId);
  const folders = currentFolderId ? [] : allFolders;
  const files = currentFolderId ? currentFolder?.files || [] : rootFiles;

  const handleFolderClick = (folderId) => {
    const folder = allFolders.find((f) => f.id === folderId);
    if (folder) {
      setCurrentFolderId(folderId);
      setBreadcrumbs((prev) => [...prev, { id: folderId, name: folder.name }]);
    }
  };

  const handleBreadcrumbClick = (breadcrumbId) => {
    setCurrentFolderId(breadcrumbId);
    setBreadcrumbs((prev) => {
      const index = prev.findIndex((b) => b.id === breadcrumbId);
      return prev.slice(0, index + 1);
    });
  };

  const allItems = [...folders, ...files];

  const toggleFileSelection = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const openDeleteModal = useCallback((file) => {
    setDeleteState({ open: true, file });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, file: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.file) return;
    try {
      console.log('Deleting file:', deleteState.file);
      closeDeleteModal();
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [deleteState.file, closeDeleteModal]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-transparent border-b border-gray-200">
        <div className="px-8 py-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Documents</h1>

          {/* Search and Actions Bar */}
          <div className="flex items-stretch gap-3 h-12">
            {/* Add Button */}
            <button className="flex items-center justify-center aspect-square h-full bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6A635] transition-colors flex-shrink-0">
              <HiPlus className="w-6 h-6" />
            </button>

            {/* Search Form */}
            <div className="flex-1 flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 h-full">
              <div className="pl-3 pr-2">
                <HiSearch className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="flex-1 h-full px-2 outline-none text-sm text-gray-700 border-0"
              />
              <button
                type="submit"
                className="bg-[#FDB54A] text-white px-6 h-full text-sm font-medium hover:bg-[#e5a43b] transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 flex-shrink-0 h-full">
              <div className="flex items-center justify-center px-3">
                <HiFilter className="w-5 h-5 text-[#FDB54A]" />
              </div>
              <select className="bg-transparent px-4 h-full text-sm text-gray-600 outline-none border-0 min-w-[140px]">
                <option value="">All Types</option>
                <option value="folder">Folders</option>
                <option value="pdf">PDF</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>
              <button className="px-4 h-full bg-[#FDB54A] text-white text-sm font-medium hover:bg-[#e5a43b] transition-colors">
                Clear
              </button>
            </div>

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
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || 'root'} className="flex items-center gap-2">
              {index > 0 && <HiChevronRight className="w-4 h-4 text-gray-400" />}
              <button
                onClick={() => handleBreadcrumbClick(crumb.id)}
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

        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="space-y-6">
            {/* Folders Grid */}
            <FoldersGridView
              folders={folders}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
              onDelete={openDeleteModal}
              onFolderClick={handleFolderClick}
            />

            {/* Files Grid */}
            <FilesGridView
              files={files}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
              onDelete={openDeleteModal}
            />
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Folders Section */}
            <FoldersListView
              folders={folders}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
              onDelete={openDeleteModal}
              onFolderClick={handleFolderClick}
            />

            {/* Files Section */}
            <FilesListView
              files={files}
              selectedFiles={selectedFiles}
              onToggleSelection={toggleFileSelection}
              onDelete={openDeleteModal}
            />
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && folders.length === 0 && (
          <div className="text-center py-12">
            <HiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-500 mb-4">Upload your first file to get started</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload File
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete File?"
        message={`Are you sure you want to delete "${deleteState.file?.name}"? This action cannot be undone.`}
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
