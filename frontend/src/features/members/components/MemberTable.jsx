import {
  HiOutlineFolder,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArchive,
} from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2'; // Add this - HiOutlineRefresh doesn't exist

export const MemberTable = ({ members, canManage, onEdit, onDelete, onViewDetails, onRestore, onArchive, pagination, onPageChange }) => {
  const getMinistryColor = (ministry) => {
    const colors = {
      'Music Ministry': 'bg-[#D4EFFF] text-[#0092FF]',
      'Media Ministry': 'bg-[#D4FFD9] text-[#00C853]',
      'Worship Ministry': 'bg-[#E8D4FF] text-[#9C27B0]',
      'Youth Ministry': 'bg-[#FFE8D4] text-[#FF9800]',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[ministry] || colors.default;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (!pagination) return [1];

    const { currentPage, totalPages } = pagination;
    const pages = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A0A0A0] text-lg">No members found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Headers */}
      <div className="flex gap-3 font-[15px] font-bold text-[#A0A0A0] px-3">
        <span className="w-[20%]">Name</span>
        <span className="w-[12%]">Gender</span>
        <span className="w-[15%]">Contact No.</span>
        <span className="w-[15%]">Birthday</span>
        <span className="w-[18%]">Ministry</span>
        <span className="w-[20%]">Command</span>
      </div>

      {/* Table Rows */}
      {members.map((member) => (
        <div
          key={member.id}
          className="flex gap-3 pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)] items-center"
        >
          {/* Name */}
          <p className="font-[15px] font-bold text-[#383838] w-[20%] pl-4">
            {member.full_name || `${member.first_name} ${member.last_name}`}
          </p>

          {/* Gender */}
          <p className="font-[15px] font-regular text-[#383838] w-[12%] capitalize">
            {member.gender || 'N/A'}
          </p>

          {/* Contact */}
          <p className="font-[15px] font-regular text-[#383838] w-[15%]">
            {member.phone || 'N/A'}
          </p>

          {/* Birthday */}
          <p className="font-[15px] font-regular text-[#383838] w-[15%]">
            {formatDate(member.date_of_birth)}
          </p>

          {/* Ministry Badge */}
          <div className="w-[18%]">
            {member.ministry_name ? (
              <div className={`${getMinistryColor(member.ministry_name)} font-[15px] font-regular rounded-full pl-4 pr-4 py-1 inline-block`}>
                {member.ministry_name}
              </div>
            ) : (
              <span className="text-[#A0A0A0]">Unassigned</span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex gap-5 w-[20%]">
            <button
              onClick={() => onViewDetails(member)}
              title="View Details"
              className="transition-colors"
            >
              <HiOutlineFolder className="w-5 h-5 text-[#FFB039] hover:text-[#e59e2f] transition-colors" />
            </button>

            {canManage && (
              <>
                <button
                  onClick={() => onEdit(member)}
                  title="Edit"
                  className="transition-colors"
                >
                  <HiOutlinePencil className="w-5 h-5 text-[#FFB039] hover:text-[#e59e2f] transition-colors" />
                </button>

                {member.status === 'archived' ? (
                  <button
                    onClick={() => onRestore(member)}
                    title="Restore"
                    className="transition-colors"
                  >
                    <HiArrowPath className="w-5 h-5 text-[#4CAF50] hover:text-[#45a049] transition-colors" />
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive(member)}
                    title="Archive"
                    className="transition-colors"
                  >
                    <HiOutlineArchive className="w-5 h-5 text-[#FF9800] hover:text-[#e68900] transition-colors" />
                  </button>
                )}

                <button
                  onClick={() => onDelete(member)}
                  title="Delete"
                  className="transition-colors"
                >
                  <HiOutlineTrash className="w-5 h-5 text-[#E55050] hover:text-[#d13e3e] transition-colors" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.previous}
            className={`px-3 py-2 rounded transition-colors ${
              !pagination.previous
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded transition-colors ${
                  page === pagination.currentPage
                    ? 'bg-[#FDB54A] text-white'
                    : 'hover:bg-gray-100'
                }`}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.next}
            className={`px-3 py-2 rounded transition-colors ${
              !pagination.next
                ? 'text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-100'
            }`}
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Results Info */}
      {pagination && pagination.count > 0 && (
        <div className="text-center text-sm text-[#A0A0A0] mt-2">
          Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.count)} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} members
        </div>
      )}
    </div>
  );
};

export default MemberTable;
