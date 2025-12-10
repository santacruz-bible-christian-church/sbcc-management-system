import PropTypes from 'prop-types';
import { HiEye, HiDownload, HiTrash, HiDotsVertical } from 'react-icons/hi';

export const FilesListView = ({ files, selectedFiles, onToggleSelection, onDelete, onFileClick }) => {
  if (files.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3 px-2">Files</h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={() => onFileClick && onFileClick(file.id)}
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <file.icon className={`w-5 h-5 ${file.color} flex-shrink-0`} />
                    <span className="font-medium text-gray-900">{file.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{file.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{file.size}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{file.modified}</span>
                </td>
                <td className="w-32 px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onFileClick && onFileClick(file.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <HiEye className="w-4 h-4 text-gray-500" />
                    </button>
                    {file.fileUrl && (
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <HiDownload className="w-4 h-4 text-gray-500" />
                      </a>
                    )}
                    <button
                      onClick={() => onDelete(file)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <HiTrash className="w-4 h-4 text-red-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <HiDotsVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

FilesListView.propTypes = {
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
  onDelete: PropTypes.func.isRequired,
  onFileClick: PropTypes.func,
};
