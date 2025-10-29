import {
  HiOutlineFolder,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';

export const MemberTable = ({ members, canManage, onEdit, onDelete, onViewDetails }) => {
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
        <h1 className="w-[20%]">Name</h1>
        <h1 className="w-[12%]">Gender</h1>
        <h1 className="w-[15%]">Contact No.</h1>
        <h1 className="w-[15%]">Birthday</h1>
        <h1 className="w-[18%]">Ministry</h1>
        <h1 className="w-[20%]">Command</h1>
      </div>

      {/* Table Rows */}
      {members.map((member) => (
        <div
          key={member.id}
          className="flex gap-3 pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)] items-center"
        >
          {/* Name */}
          <p className="font-[15px] font-bold text-[#383838] w-[20%] pl-4">
            {member.name}
          </p>

          {/* Gender */}
          <p className="font-[15px] font-regular text-[#383838] w-[12%]">
            {member.gender || 'N/A'}
          </p>

          {/* Contact */}
          <p className="font-[15px] font-regular text-[#383838] w-[15%]">
            {member.phone || 'N/A'}
          </p>

          {/* Birthday */}
          <p className="font-[15px] font-regular text-[#383838] w-[15%]">
            {formatDate(member.birthday)}
          </p>

          {/* Ministry Badge */}
          <div className="w-[18%]">
            {member.ministry ? (
              <div className={`${getMinistryColor(member.ministry)} font-[15px] font-regular rounded-full pl-4 pr-4 py-1 inline-block`}>
                {member.ministry}
              </div>
            ) : (
              <span className="text-[#A0A0A0]">Unassigned</span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex gap-5 w-[20%]">
            <button onClick={() => onViewDetails(member)} title="View Details">
              <HiOutlineFolder className="w-5 h-5 text-[#FFB039] hover:text-[#e59e2f]" />
            </button>

            {canManage && (
              <>
                <button onClick={() => onEdit(member)} title="Edit">
                  <HiOutlinePencil className="w-5 h-5 text-[#FFB039] hover:text-[#e59e2f]" />
                </button>

                <button onClick={() => onDelete(member)} title="Delete">
                  <HiOutlineTrash className="w-5 h-5 text-[#E55050] hover:text-[#d13e3e]" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button className="px-3 py-2 hover:bg-gray-100 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
          <button
            key={page}
            className={`px-3 py-2 rounded ${page === 1 ? 'bg-[#FDB54A] text-white' : 'hover:bg-gray-100'}`}
          >
            {page}
          </button>
        ))}

        <button className="px-3 py-2 hover:bg-gray-100 rounded">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MemberTable;
