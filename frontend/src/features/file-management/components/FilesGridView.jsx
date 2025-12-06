import PropTypes from 'prop-types';
import { HiEye, HiDownload, HiTrash, HiDotsVertical } from 'react-icons/hi';

export const FilesGridView = ({ files, selectedFiles, onToggleSelection, onDelete }) => {
  if (files.length === 0) return null;

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
            {/* More Options */}
            <button className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-lg transition-all">
              <HiDotsVertical className="w-4 h-4 text-gray-500" />
            </button>

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
              <button
                className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                title="View"
              >
                <HiEye className="w-4 h-4 text-gray-600 mx-auto" />
              </button>
              <button
                className="flex-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                title="Download"
              >
                <HiDownload className="w-4 h-4 text-gray-600 mx-auto" />
              </button>
              <button
                onClick={() => onDelete(file)}
                className="flex-1 p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <HiTrash className="w-4 h-4 text-red-500 mx-auto" />
              </button>
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
    })
  ).isRequired,
  selectedFiles: PropTypes.array.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
