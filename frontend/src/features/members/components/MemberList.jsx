import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    HiOutlineArchive,
    HiOutlineFolder,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePhone,
} from 'react-icons/hi';
import { HiArrowPath } from 'react-icons/hi2';
import { generateColorFromId, getContrastColor, generateHexFromId } from '../../../utils/colorUtils';
import { Pagination } from '../../../components/ui/Pagination';
import { MembersSkeleton } from './MembersSkeleton';


const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Column Headers
const ListHeaders = ({ showCheckbox, allSelected, onSelectAll }) => (
    <div className="pr-3 pl-3 flex justify-between font-[15px] font-bold text-[#A0A0A0]">
        {showCheckbox && (
            <div className="w-[5%] flex items-center justify-center">
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FDB54A] focus:ring-[#FDB54A] cursor-pointer"
                />
            </div>
        )}
        <h1 className={showCheckbox ? "w-[15%]" : "w-[18%]"}>Name</h1>
        <h1 className="hidden lg:flex justify-center w-[10%]">Gender</h1>
        <h1 className="flex justify-center w-[15%] lg:w-[15%]">Contact No.</h1>
        <h1 className="hidden lg:flex justify-center w-[15%]">Birthday</h1>
        <h1 className="flex justify-center w-[20%]">Ministry</h1>
        <h1 className="flex justify-center w-[18%]">Actions</h1>
    </div>
);

// Action Button
const ActionButton = ({ onClick, title, icon: Icon, colorClass, className = '' }) => (
    <button
        onClick={onClick}
        title={title}
        className={`transition-colors ${className}`}
    >
        <Icon className={`w-5 h-5 ${colorClass}`} />
    </button>
);

// Single Member Card/Row
const MemberCard = ({
    member,
    canManage,
    onEdit,
    onDelete,
    onViewDetails,
    onRestore,
    onArchive,
    showCheckbox = false,
    isSelected = false,
    onSelect
}) => {
    return (
        <div className={`flex justify-between pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)] transition-all ${
            isSelected ? 'ring-2 ring-[#FDB54A] bg-[#FFF8E7]' : ''
        }`}>
            {/* Checkbox */}
            {showCheckbox && (
                <div className="w-[5%] flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onSelect?.(member.id, e.target.checked);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-[#FDB54A] focus:ring-[#FDB54A] cursor-pointer"
                    />
                </div>
            )}

            {/* Name */}
            <p className={`font-bold text-[#383838] text-left items-center ${showCheckbox ? 'w-[15%]' : 'w-[18%]'}`}>
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
            <div
                className="flex w-[20%] text-sm font-medium rounded-lg px-3 py-1.5 items-center justify-center"
                style={member.ministry ? {
                    backgroundColor: `${generateHexFromId(member.ministry)}15`,
                    color: generateHexFromId(member.ministry),
                    borderLeft: `3px solid ${generateHexFromId(member.ministry)}`
                } : {
                    backgroundColor: '#F9FAFB',
                    color: '#9CA3AF',
                    borderLeft: '3px solid #E5E7EB'
                }}
            >
                <span className="truncate">{member.ministry_name || 'Unassigned'}</span>
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


// Results Info
const ResultsInfo = ({ pagination }) => {
    const startIndex = (pagination.currentPage - 1) * 10 + 1;
    const endIndex = Math.min(pagination.currentPage * 10, pagination.count);

    return (
        <div className="text-center text-sm text-[#A0A0A0] mt-2">
            Showing {Math.min(startIndex, pagination.count)} - {endIndex} of {pagination.count} members
        </div>
    );
};

// Main MemberList Component
export const MemberList = ({
    members,
    loading,
    canManage,
    onEdit,
    onDelete,
    onViewDetails,
    onRestore,
    onArchive,
    pagination,
    onPageChange,
    showCheckbox = false,
    selectedIds = [],
    allSelected = false,
    onSelect,
    onSelectAll
}) => {
    if (loading) {
        return <MembersSkeleton />;
    }

    if (!members || members.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">No members found</h2>
                <p className="text-sm text-gray-500">Try adjusting your filters or add a new member.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3.5">
            {/* Column Headers */}
            <ListHeaders
                showCheckbox={showCheckbox}
                allSelected={allSelected}
                onSelectAll={onSelectAll}
            />

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
                    showCheckbox={showCheckbox}
                    isSelected={selectedIds.includes(member.id)}
                    onSelect={onSelect}
                />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    hasNext={!!pagination.next}
                    hasPrevious={!!pagination.previous}
                />
            )}

            {/* Results Info */}
            {pagination && pagination.count > 0 && (
                <ResultsInfo pagination={pagination} />
            )}
        </div>
    );
};

MemberList.propTypes = {
    members: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    canManage: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onViewDetails: PropTypes.func,
    onRestore: PropTypes.func,
    onArchive: PropTypes.func,
    pagination: PropTypes.object,
    onPageChange: PropTypes.func,
    showCheckbox: PropTypes.bool,
    selectedIds: PropTypes.array,
    allSelected: PropTypes.bool,
    onSelect: PropTypes.func,
    onSelectAll: PropTypes.func,
};

export default MemberList;
