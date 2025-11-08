import { useSideBar } from '../../../context/SideBarContext'
import {
    HiOutlineArchive,
    HiOutlineFolder,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePhone,
} from 'react-icons/hi';


export const ListCards = ({ members, canManage, onEdit, onDelete, onViewDetails, onRestore, onArchive, pagination, onPageChange }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

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


    const { collapsed, toggleSideBar } = useSideBar()

    const getMinistryColor = (ministry) => {
        const colors = {
            'Music Ministry': 'bg-blue-100 text-blue-700',
            'Youth Ministry': 'bg-purple-100 text-purple-700',
            'Children Ministry': 'bg-pink-100 text-pink-700',
            'Prayer Ministry': 'bg-green-100 text-green-700',
            'Media Ministry': 'bg-[#D4FFD9] text-[#00C853]',
            'Worship Ministry': 'bg-[#E8D4FF] text-[#9C27B0]',
            default: 'bg-gray-100 text-gray-700',
        };
        return colors[ministry] || colors.default;
    };

    return (
        <div className="space-y-3.5">
            {members.map((member) => (
                <div className='flex gap-3 pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)]'>
                    {/* Name */}
                    <p className={`flex font-bold text-[#383838] text-left items-center ${collapsed ? 'w-[210px] truncate overflow-hidden text-ellipsis pl-7 mr-[0%]' : 'line-clamp-2 overflow-hidden text-ellipsis w-[160px] pl-3 mr-[0.5%]'} transition-all duration-500 ease-in-out`}>
                        {member.full_name || `${member.first_name} ${member.last_name}`}
                    </p>
                    {/* Gender */}
                    <p className={`flex items-center justify-center ${collapsed ? 'w-[110px] mr-[1%]' : 'w-[100px] mr-[0%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                        {member.gender || 'N/A'}
                    </p>
                    {/* Phone Number */}
                    <p className={`flex items-center justify-center truncate text-center ${collapsed ? 'w-[210px] mr-[1.5%]' : 'w-[240px] mr-[0%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                        <HiOutlinePhone className="mr-1 h-4 w-4 text-sbcc-gray" />
                        <span className="text-sbcc-dark">{member.phone || 'N/A'}</span>
                    </p>

                    {/* Birthday */}
                    <p className={`flex items-center justify-center ${collapsed ? 'w-[130px] mr-[2.3%]' : 'w-[160px] mr-[1.8%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                        {formatDate(member.date_of_birth)}
                    </p>

                    {/* Ministry */}
                    <div>
                        {member.ministry_name ? (
                            <div className={`${getMinistryColor(member.ministry_name)} ${collapsed ? 'w-[130px]' : 'w-[100px] mr-[10%]'} text-[#0092FF] text-[15px] font-regular rounded-full pl-1 pr-1 pt-1 pb-1 mr-[2.5%] text-center`}>
                                {member.ministry_name}
                            </div>
                        ) : (
                            <div className={`${collapsed ? ' mr-[10%] w-[130px]' : 'pt-3 mr-[10%] w-[100px]'} text-[#A0A0A0] text-center`}>Unassigned</div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={`${collapsed ? 'pt-0.5 ml-[30px]' : 'pt-1 pr-2 ml-[2%]'}  transition-all duration-500 ease-in-out flex gap-5`}>
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
                        className={`px-3 py-2 rounded transition-colors ${!pagination.previous
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
                                className={`px-3 py-2 rounded transition-colors ${page === pagination.currentPage
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
                        className={`px-3 py-2 rounded transition-colors ${!pagination.next
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
        </div >
    )
}
