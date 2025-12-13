import PropTypes from 'prop-types';
import { HiChevronRight } from 'react-icons/hi';

export const FoldersGridView = ({ folders, selectedFiles, onToggleSelection, onDelete, onFolderClick }) => {
  if (folders.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3 px-2">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onFolderClick && onFolderClick(folder.id)}
            className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-[#FDB54A] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <folder.icon className={`w-8 h-8 ${folder.color}`} />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 text-center mb-1">
                {folder.name}
              </h3>
              <p className="text-xs text-gray-500">{folder.size}</p>
            </div>
            <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 group-hover:text-[#FDB54A] transition-colors flex items-center gap-1">
                View meetings <HiChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

FoldersGridView.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedFiles: PropTypes.array.isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFolderClick: PropTypes.func,
};
