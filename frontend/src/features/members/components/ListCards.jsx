import { useMemo } from 'react';
import {
    HiOutlineArchive,
    HiOutlineFolder,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePhone,
} from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2';

// Ministry color mapping
const MINISTRY_COLORS = {
    'Music Ministry': 'bg-blue-100 text-blue-700',
    'Youth Ministry': 'bg-purple-100 text-purple-700',
    'Children Ministry': 'bg-pink-100 text-pink-700',
    'Prayer Ministry': 'bg-green-100 text-green-700',
    'Media Ministry': 'bg-[#D4FFD9] text-[#00C853]',
    'Worship Ministry': 'bg-[#E8D4FF] text-[#9C27B0]',
    default: 'bg-gray-100 text-gray-700',
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getMinistryColor = (ministry) => {
    return MINISTRY_COLORS[ministry] || MINISTRY_COLORS.default;
};

const getPageNumbers = (pagination) => {
    if (!pagination) return [1];

    const { currentPage, totalPages } = pagination;
    const pages = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        pages.push(totalPages);
    }

    return pages;
};

const ActionButton = ({ onClick, title, icon: Icon, colorClass, className = '' }) => (
    <button
        onClick={onClick}
        title={title}
        className={`transition-colors ${className}`}
    >
        <Icon className={`w-5 h-5 ${colorClass}`} />
    </button>
);

const MemberCard = ({ member, canManage, onEdit, onDelete, onViewDetails, onRestore, onArchive }) => {
    return (
        <div className="flex justify-between pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)]">
            {/* Name */}
            <p className="font-bold text-[#383838] text-left items-center w-[18%]">
                {member.full_name || `${member.first_name} ${member.last_name}`}
            </p>

            {/* Gender */}
            <p className="hidden lg:flex items-center justify-center w-[10%] font-regular text-[#383838]">
                {member.gender || 'N/A'}
            </p>

            {/* Contact Number */}
            <p className="w-[15%] flex items-center justify-center text-center font-regular text-[#383838]">
                <HiOutlinePhone className="mr-1 h-4 w-4 text-sbcc-gray" />
                <span className="text-sbcc-dark truncate">{member.phone || 'N/A'}</span>
            </p>

            {/* Birthday */}
            <p className="hidden lg:flex items-center justify-center text-center w-[15%] font-regular text-[#383838]">
                {formatDate(member.date_of_birth)}
            </p>

            {/* Ministry */}
            <div className={`${getMinistryColor(member.ministry_name)} flex w-[20%] text-[15px] text-sm font-regular rounded-full pl-1 pr-1 pt-1 pb-1 items-center text-center justify-center`}>
                {member.ministry_name ? (
                    <div className="truncate">{member.ministry_name}</div>
                ) : (
                    <div className="text-[#A0A0A0]">Unassigned</div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 w-[18%]">
                <ActionButton
                    onClick={() => onViewDetails(member)}
                    title="View Details"
                    icon={HiOutlineFolder}
                    colorClass="text-[#FFB039] hover:text-[#e59e2f] transition-colors"
                />

                {canManage && (
                    <>
                        <ActionButton
                            onClick={() => onEdit(member)}
                            title="Edit"
                            icon={HiOutlinePencil}
                            colorClass="text-[#FFB039] hover:text-[#e59e2f] transition-colors"
                        />

                        {member.status === 'archived' ? (
                            <ActionButton
                                onClick={() => onRestore(member)}
                                title="Restore"
                                icon={HiArrowPath}
                                colorClass="text-[#4CAF50] hover:text-[#45a049] transition-colors"
                            />
                        ) : (
                            <ActionButton
                                onClick={() => onArchive(member)}
                                title="Archive"
                                icon={HiOutlineArchive}
                                colorClass="text-[#FF9800] hover:text-[#e68900] transition-colors"
                                className="hidden md:block"
                            />
                        )}

                        <ActionButton
                            onClick={() => onDelete(member)}
                            title="Delete"
                            icon={HiOutlineTrash}
                            colorClass="text-[#E55050] hover:text-[#d13e3e] transition-colors"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

const PaginationControls = ({ pagination, onPageChange }) => {
    const pageNumbers = useMemo(() => getPageNumbers(pagination), [pagination]);

    return (
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
            {pageNumbers.map((page, index) => (
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
    );
};

const ResultsInfo = ({ pagination }) => {
    const startIndex = (pagination.currentPage - 1) * 10 + 1;
    const endIndex = Math.min(pagination.currentPage * 10, pagination.count);

    return (
        <div className="text-center text-sm text-[#A0A0A0] mt-2">
            Showing {Math.min(startIndex, pagination.count)} - {endIndex} of {pagination.count} members
        </div>
    );
};

export const ListCards = ({
    members,
    canManage,
    onEdit,
    onDelete,
    onViewDetails,
    onRestore,
    onArchive,
    pagination,
    onPageChange
}) => {
    return (
        <div className="space-y-3.5">
            {/* Member Cards */}
            {members.map((member) => (
                <MemberCard
                    key={member.id}
                    member={member}
                    canManage={canManage}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                    onRestore={onRestore}
                    onArchive={onArchive}
                />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <PaginationControls
                    pagination={pagination}
                    onPageChange={onPageChange}
                />
            )}

            {/* Results Info */}
            {pagination && pagination.count > 0 && (
                <ResultsInfo pagination={pagination} />
            )}
        </div>
    );
};
