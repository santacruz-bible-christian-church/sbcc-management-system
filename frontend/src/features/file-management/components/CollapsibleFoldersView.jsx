import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiChevronDown, HiChevronRight, HiDownload, HiPencil, HiTrash, HiDocumentText, HiArrowRight } from 'react-icons/hi';

/**
 * Collapsible Category with nested files
 */
const CollapsibleCategory = ({
  folder,
  files,
  isExpanded,
  onToggle,
  onFolderClick,
  onFileClick,
  onFileDelete,
  onExportPdf,
}) => {
  const categoryFiles = files.filter((f) => f._original?.category === folder.id);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Folder Header */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        {/* Left side - Expand/Collapse toggle */}
        <button
          onClick={() => onToggle(folder.id)}
          className="flex items-center gap-3 flex-1"
        >
          {isExpanded ? (
            <HiChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <HiChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <folder.icon className={`w-5 h-5 ${folder.color}`} />
          <span className="font-medium text-gray-900">{folder.name}</span>
          <span className="text-sm text-gray-500">({categoryFiles.length} files)</span>
        </button>

        {/* Right side - Navigate into folder button */}
        <button
          onClick={() => onFolderClick && onFolderClick(folder.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Open category"
        >
          <HiArrowRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Collapsible Files Section */}
      {isExpanded && categoryFiles.length > 0 && (
        <div className="border-t border-gray-200">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {categoryFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="pl-12 pr-4 py-3">
                    <div className="flex items-center gap-3">
                      <HiDocumentText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{file.modified}</span>
                  </td>
                  <td className="w-32 px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {/* Edit */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileClick && onFileClick(file.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Export PDF */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportPdf && onExportPdf(file._original?.id || file.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <HiDownload className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDelete && onFileDelete(file);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state for expanded folder */}
      {isExpanded && categoryFiles.length === 0 && (
        <div className="border-t border-gray-200 px-12 py-4 text-sm text-gray-500">
          No files in this category
        </div>
      )}
    </div>
  );
};

/**
 * Collapsible Folders View - Shows categories with nested files
 */
export const CollapsibleFoldersView = ({
  folders,
  files,
  onFolderClick,
  onFileClick,
  onFileDelete,
  onExportPdf,
}) => {
  const [expandedFolders, setExpandedFolders] = useState({});

  const handleToggle = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    folders.forEach((f) => {
      allExpanded[f.id] = true;
    });
    setExpandedFolders(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedFolders({});
  };

  if (folders.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-semibold text-gray-700">Categories</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleCollapseAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Folders list */}
      <div className="space-y-2">
        {folders.map((folder) => (
          <CollapsibleCategory
            key={folder.id}
            folder={folder}
            files={files}
            isExpanded={!!expandedFolders[folder.id]}
            onToggle={handleToggle}
            onFolderClick={onFolderClick}
            onFileClick={onFileClick}
            onFileDelete={onFileDelete}
            onExportPdf={onExportPdf}
          />
        ))}
      </div>
    </div>
  );
};

CollapsibleFoldersView.propTypes = {
  folders: PropTypes.array.isRequired,
  files: PropTypes.array.isRequired,
  onFolderClick: PropTypes.func,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onExportPdf: PropTypes.func,
};

export default CollapsibleFoldersView;
