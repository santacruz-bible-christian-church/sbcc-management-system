import { HiHome, HiChevronRight } from 'react-icons/hi';

export const FileBreadcrumbs = ({ breadcrumbs, onBreadcrumbClick }) => {
  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id || 'root'} className="flex items-center gap-2">
          {index > 0 && <HiChevronRight className="w-4 h-4 text-gray-400" />}
          <button
            onClick={() => onBreadcrumbClick(crumb)}
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
  );
};

export default FileBreadcrumbs;
