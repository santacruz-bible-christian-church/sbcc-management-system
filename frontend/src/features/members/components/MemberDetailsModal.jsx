import PropTypes from 'prop-types';
import { HiX, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar, HiOutlineUser, HiOutlineOfficeBuilding } from 'react-icons/hi';

export const MemberDetailsModal = ({ open, onClose, member }) => {
  if (!open || !member) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member.date_of_birth);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {member.full_name || `${member.first_name} ${member.last_name}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Member Profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Badge */}
            {member.status && (
              <div className="mb-6">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  member.status === 'active' ? 'bg-green-100 text-green-700' :
                  member.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                    <HiOutlineMail className="w-5 h-5 text-[#FDB54A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{member.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                    <HiOutlinePhone className="w-5 h-5 text-[#FDB54A]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{member.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {member.address && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{member.address}</p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HiOutlineUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {member.gender || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(member.date_of_birth)}
                      {age && ` (${age} years old)`}
                    </p>
                  </div>
                </div>

                {member.baptism_date && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <HiOutlineCalendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Baptism Date</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(member.baptism_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ministry Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ministry Information</h4>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FDB54A] bg-opacity-10 rounded-lg">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-[#FDB54A]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Ministry</p>
                  <p className="text-sm font-medium text-gray-900">
                    {member.ministry_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Membership Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(member.membership_date)}
                  </p>
                </div>

                {member.attendance_rate !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Attendance Rate</p>
                    <p className="text-sm font-medium text-gray-900">
                      {member.attendance_rate}%
                    </p>
                  </div>
                )}

                {member.last_attended && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Last Attended</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(member.last_attended)}
                    </p>
                  </div>
                )}

                {member.consecutive_absences !== undefined && member.consecutive_absences > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">Consecutive Absences</p>
                    <p className="text-sm font-medium text-red-700">
                      {member.consecutive_absences} {member.consecutive_absences === 1 ? 'time' : 'times'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(member.created_at)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {formatDate(member.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

MemberDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  member: PropTypes.object,
};

export default MemberDetailsModal;
