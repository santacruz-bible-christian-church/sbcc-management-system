import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlinePhone,
  HiOutlineMail
} from 'react-icons/hi';

export const MemberCard = ({ member, canManage, onEdit, onDelete, onViewDetails }) => {
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
    const colors = {
      'Music Ministry': 'bg-blue-100 text-blue-700',
      'Youth Ministry': 'bg-purple-100 text-purple-700',
      'Children Ministry': 'bg-pink-100 text-pink-700',
      'Prayer Ministry': 'bg-green-100 text-green-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[ministry] || colors.default;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Name */}
        <div className="md:col-span-3">
          <p className="font-semibold text-sbcc-dark text-lg">{member.name}</p>
          <p className="text-sm text-sbcc-gray">{member.email}</p>
        </div>

        {/* Gender */}
        <div className="md:col-span-2">
          <span className="text-sm text-sbcc-gray md:hidden font-medium">Gender: </span>
          <span className="text-sbcc-dark">{member.gender || 'N/A'}</span>
        </div>

        {/* Contact */}
        <div className="md:col-span-2">
          <span className="text-sm text-sbcc-gray md:hidden font-medium">Contact: </span>
          <div className="flex items-center gap-2">
            <HiOutlinePhone className="h-4 w-4 text-sbcc-gray" />
            <span className="text-sbcc-dark">{member.phone || 'N/A'}</span>
          </div>
        </div>

        {/* Ministry */}
        <div className="md:col-span-2">
          <span className="text-sm text-sbcc-gray md:hidden font-medium">Ministry: </span>
          {member.ministry ? (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMinistryColor(member.ministry)}`}>
              {member.ministry}
            </span>
          ) : (
            <span className="text-sbcc-gray">Unassigned</span>
          )}
        </div>

        {/* Birthday */}
        <div className="md:col-span-2">
          <span className="text-sm text-sbcc-gray md:hidden font-medium">Birthday: </span>
          <span className="text-sbcc-dark">{formatDate(member.birthday)}</span>
        </div>

        {/* Actions */}
        <div className="md:col-span-1 flex gap-2 justify-end">
          <button
            onClick={onViewDetails}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <HiOutlineEye className="h-5 w-5 text-blue-600" />
          </button>

          {canManage && (
            <>
              <button
                onClick={onEdit}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                title="Edit"
              >
                <HiOutlinePencil className="h-5 w-5 text-sbcc-primary" />
              </button>

              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <HiOutlineTrash className="h-5 w-5 text-red-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
