import PropTypes from 'prop-types';
import { HiDownload, HiTrash, HiPencil } from 'react-icons/hi';

export const FilesListView = ({ files, selectedFiles, onToggleSelection, onDelete, onFileClick, onExportPdf }) => {
  if (files.length === 0) return null;

  const handleEdit = (file, e) => {
    e.stopPropagation();
    onFileClick && onFileClick(file.id);
  };

  const handleDelete = (file, e) => {
    e.stopPropagation();
    onDelete(file);
  };

  const handleExportPdf = (file, e) => {
    e.stopPropagation();
    // Use the original meeting ID if available
    const meetingId = file._original?.id || file.id;
    onExportPdf && onExportPdf(meetingId);
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3 px-2">Files</h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr
                key={file.id}
                className={`hover:bg-gray-50 transition-colors ${
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
                <td className="w-32 px-6 py-4">
                  <div className="flex items-center gap-1">
                    {/* Edit Button */}
                    <button
                      onClick={(e) => handleEdit(file, e)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <HiPencil className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Download/Export PDF Button */}
                    {file.fileUrl ? (
                      // Attachment with direct URL
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <HiDownload className="w-4 h-4 text-gray-500" />
                      </a>
                    ) : onExportPdf ? (
                      // Meeting minutes - export as PDF
                      <button
                        onClick={(e) => handleExportPdf(file, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <HiDownload className="w-4 h-4 text-gray-500" />
                      </button>
                    ) : null}

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(file, e)}
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
  onExportPdf: PropTypes.func,
};
