import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

/**
 * Pagination - Modern pagination component
 * Features: Jump to first/last, smooth transitions, responsive design
 */
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrevious,
  showPageInfo = true,
  totalCount = null,
}) => {
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const buttonBase = "flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed";
  const navButton = `${buttonBase} w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700`;
  const pageButton = `${buttonBase} min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium`;

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Navigation */}
      <nav className="inline-flex items-center gap-1 bg-white rounded-xl px-2 py-1.5 shadow-sm border border-gray-200/80">
        {/* First Page */}
        <button
          className={navButton}
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          title="First page"
        >
          <HiChevronDoubleLeft className="w-4 h-4" />
        </button>

        {/* Previous */}
        <button
          className={navButton}
          disabled={!hasPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
              >
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${pageButton} ${
                  page === currentPage
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Next */}
        <button
          className={navButton}
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next page"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          className={navButton}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last page"
        >
          <HiChevronDoubleRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Page Info */}
      {showPageInfo && (
        <p className="text-xs text-gray-400">
          Page <span className="font-medium text-gray-600">{currentPage}</span> of{' '}
          <span className="font-medium text-gray-600">{totalPages}</span>
          {totalCount && (
            <span className="ml-1">
              ({totalCount.toLocaleString()} total)
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default Pagination;
