import PropTypes from 'prop-types';
import { HiDownload, HiTrash, HiPencil } from 'react-icons/hi';

export const FilesGridView = ({
  files,
  selectedFiles,
  onToggleSelection,
  onDelete,
  onFileClick,
  canWrite = true,
}) => {
  if (files.length === 0) return null;
  const canEdit = canWrite && typeof onFileClick === 'function';
  const canDelete = canWrite && typeof onDelete === 'function';

  const handleEdit = (file, e) => {
    e.stopPropagation();
    onFileClick && onFileClick(file.id);
  };

  const handleDelete = (file, e) => {
    e.stopPropagation();
    onDelete && onDelete(file);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3 px-2">Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`bg-white rounded-xl p-5 border-2 transition-all group relative ${
              selectedFiles.includes(file.id)
                ? 'border-blue-400 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* Icon */}
            <div className="flex flex-col items-center mt-2 mb-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                <file.icon className={`w-8 h-8 ${file.color}`} />
              </div>

              {/* File Name */}
              <h3 className="font-semibold text-sm text-gray-900 text-center mb-2 line-clamp-2 w-full px-2">
                {file.name}
              </h3>

              {/* File Info */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <span className="font-medium">{file.type}</span>
                <span>•</span>
                <span>{file.size}</span>
              </div>

              {/* Modified */}
              <p className="text-xs text-gray-400">{file.modified}</p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-1 pt-3 border-t border-gray-100">
              {/* Edit Button */}
              {canEdit && (
                <button
                  onClick={(e) => handleEdit(file, e)}
                  className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <HiPencil className="w-4 h-4 text-gray-600 mx-auto" />
                </button>
              )}

              {/* Download Button - Only show if file has URL */}
              {file.fileUrl && (
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <HiDownload className="w-4 h-4 text-gray-600 mx-auto" />
                </a>
              )}

              {/* Delete Button */}
              {canDelete && (
                <button
                  onClick={(e) => handleDelete(file, e)}
                  className="flex-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <HiTrash className="w-4 h-4 text-red-500 mx-auto" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

FilesGridView.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      modified: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      color: PropTypes.string.isRequired,
      fileUrl: PropTypes.string,
    })
  ).isRequired,
  selectedFiles: PropTypes.array.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onFileClick: PropTypes.func,
  canWrite: PropTypes.bool,
};
