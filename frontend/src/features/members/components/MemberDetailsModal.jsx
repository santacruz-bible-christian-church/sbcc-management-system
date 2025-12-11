import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentDownload,
} from 'react-icons/hi';
import { membersApi } from '../../../api/members.api';
import { MemberAttendanceHistory } from './MemberAttendanceHistory';
import { MemberCelebrationCard } from './MemberCelebrationCard';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

// Reusable info display component
const InfoItem = ({ icon: Icon, iconBg, label, value }) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

// Section wrapper
const Section = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
    {children}
  </div>
);

export const MemberDetailsModal = ({ open, onClose, member }) => {
  const [exporting, setExporting] = useState(false);

  if (!open || !member) return null;

  const age = calculateAge(member.date_of_birth);

  const handleExportProfile = async () => {
    if (!member?.id) return;

    setExporting(true);
    try {
      const blob = await membersApi.exportProfilePDF(member.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = member.full_name?.replace(/\s+/g, '_').toLowerCase() || 'member';
      link.download = `member_profile_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Profile export error:', err);
      alert('Failed to export profile. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {member.full_name || `${member.first_name} ${member.last_name}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Member Profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status Badge */}
            {member.status && (
              <div className="mb-6">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : member.status === 'archived'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
              </div>
            )}

            {/* Upcoming Celebrations */}
            {(member.date_of_birth || member.membership_date) && (
              <Section title="Upcoming Celebrations">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <MemberCelebrationCard date={member.date_of_birth} type="birthday" label="Birthday" />
                  <MemberCelebrationCard date={member.membership_date} type="anniversary" label="Membership Anniversary" />
                </div>
              </Section>
            )}

            {/* Contact Information */}
            <Section title="Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={HiOutlineMail}
                  iconBg="bg-[#FDB54A] bg-opacity-10 text-[#FDB54A]"
                  label="Email"
                  value={member.email}
                />
                <InfoItem
                  icon={HiOutlinePhone}
                  iconBg="bg-[#FDB54A] bg-opacity-10 text-[#FDB54A]"
                  label="Phone"
                  value={member.phone}
                />
              </div>
              {member.address && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{member.address}</p>
                </div>
              )}
            </Section>

            {/* Personal Information */}
            <Section title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={HiOutlineUser}
                  iconBg="bg-blue-100 text-blue-600"
                  label="Gender"
                  value={member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : null}
                />
                <InfoItem
                  icon={HiOutlineCalendar}
                  iconBg="bg-purple-100 text-purple-600"
                  label="Date of Birth"
                  value={`${formatDate(member.date_of_birth)}${age ? ` (${age} years old)` : ''}`}
                />
                {member.baptism_date && (
                  <InfoItem
                    icon={HiOutlineCalendar}
                    iconBg="bg-cyan-100 text-cyan-600"
                    label="Baptism Date"
                    value={formatDate(member.baptism_date)}
                  />
                )}
              </div>
            </Section>

            {/* Ministry Information */}
            <Section title="Ministry Information">
              <InfoItem
                icon={HiOutlineOfficeBuilding}
                iconBg="bg-[#FDB54A] bg-opacity-10 text-[#FDB54A]"
                label="Current Ministry"
                value={member.ministry_name || 'Unassigned'}
              />
            </Section>

            {/* Membership Details */}
            <Section title="Membership Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(member.membership_date)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Member ID</p>
                  <p className="text-sm font-medium text-gray-900">#{member.id}</p>
                </div>
              </div>
            </Section>

            {/* Attendance History */}
            <MemberAttendanceHistory memberId={member.id} />

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
          <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleExportProfile}
              disabled={exporting}
              className={`px-4 py-2 border border-[#FDB54A] text-[#FDB54A] rounded-lg hover:bg-[#FDB54A] hover:text-white transition-colors flex items-center gap-2 ${
                exporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {exporting ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <HiOutlineDocumentDownload className="w-4 h-4" />
              )}
              Export PDF
            </button>
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
