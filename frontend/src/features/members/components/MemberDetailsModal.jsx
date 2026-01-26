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
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineHeart,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineChartBar,
} from 'react-icons/hi';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import MemberProfilePDF from './MemberProfilePDF';
import { generateMembershipFormPDF } from '../utils/memberFormPDF';
import { MemberAttendanceHistory } from './MemberAttendanceHistory';
import { MemberCelebrationCard } from './MemberCelebrationCard';
import { showError, showSuccess } from '../../../utils/toast';

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

const formatMaritalStatus = (status) => {
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
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

// Simple info row without icon
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

// Section wrapper
const Section = ({ title, children, collapsed = false }) => (
  <div className="mb-6">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
    {children}
  </div>
);

// Collapsible Section
const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export const MemberDetailsModal = ({ open, onClose, member }) => {
  const [exporting, setExporting] = useState(false);
  const [exportingForm, setExportingForm] = useState(false);

  if (!open || !member) return null;

  const age = calculateAge(member.date_of_birth);

  const handleExportProfile = async () => {
    if (!member) return;

    setExporting(true);
    try {
      // Generate PDF using @react-pdf/renderer
      const blob = await pdf(<MemberProfilePDF member={member} />).toBlob();
      const safeName = (member.full_name || `${member.first_name}_${member.last_name}`)
        .replace(/\s+/g, '_')
        .toLowerCase();
      const fileName = `member_report_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;

      saveAs(blob, fileName);
      showSuccess('Member report downloaded successfully');
    } catch (err) {
      console.error('Profile export error:', err);
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportMembershipForm = async () => {
    if (!member) return;

    setExportingForm(true);
    try {
      await generateMembershipFormPDF(member);
      showSuccess('Membership form downloaded successfully');
    } catch (err) {
      console.error('Membership form export error:', err);
      showError('Failed to generate membership form. Please try again.');
    } finally {
      setExportingForm(false);
    }
  };

  // Check if member has educational info
  const hasEducation = member.elementary_school || member.secondary_school ||
                       member.vocational_school || member.college;

  // Check if member has spiritual info
  const hasSpiritualInfo = member.accepted_jesus !== null || member.spiritual_birthday ||
                           member.salvation_testimony || member.willing_to_be_baptized !== null;

  // Check if member has church background
  const hasChurchBackground = member.previous_church || member.how_introduced ||
                              member.began_attending_since;

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
              {member.complete_address && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <HiOutlineLocationMarker className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Address</p>
                    <p className="text-sm text-gray-900">{member.complete_address}</p>
                  </div>
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
                <InfoItem
                  icon={HiOutlineBriefcase}
                  iconBg="bg-indigo-100 text-indigo-600"
                  label="Occupation"
                  value={member.occupation}
                />
                <InfoItem
                  icon={HiOutlineHeart}
                  iconBg="bg-pink-100 text-pink-600"
                  label="Marital Status"
                  value={formatMaritalStatus(member.marital_status)}
                />
                {member.wedding_anniversary && (
                  <InfoItem
                    icon={HiOutlineHeart}
                    iconBg="bg-red-100 text-red-600"
                    label="Wedding Anniversary"
                    value={formatDate(member.wedding_anniversary)}
                  />
                )}
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
                value={member.ministry_name || 'Member'}
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

            {/* Attendance Statistics */}
            <Section title="Attendance Statistics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineChartBar className="w-5 h-5 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">Attendance Rate</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {member.attendance_rate ? `${parseFloat(member.attendance_rate).toFixed(1)}%` : '0%'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineCalendar className="w-5 h-5 text-blue-600" />
                    <p className="text-xs text-blue-700 font-medium">Last Attended</p>
                  </div>
                  <p className="text-sm font-bold text-blue-700">
                    {member.last_attended ? formatDate(member.last_attended) : 'Never'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineUser className="w-5 h-5 text-orange-600" />
                    <p className="text-xs text-orange-700 font-medium">Consecutive Absences</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {member.consecutive_absences || 0}
                  </p>
                </div>
              </div>
            </Section>

            {/* Educational Background - Collapsible */}
            {hasEducation && (
              <CollapsibleSection title="Educational Background">
                <div className="space-y-2">
                  {member.elementary_school && (
                    <InfoRow
                      label="Elementary School"
                      value={`${member.elementary_school}${member.elementary_year_graduated ? ` (${member.elementary_year_graduated})` : ''}`}
                    />
                  )}
                  {member.secondary_school && (
                    <InfoRow
                      label="Secondary School"
                      value={`${member.secondary_school}${member.secondary_year_graduated ? ` (${member.secondary_year_graduated})` : ''}`}
                    />
                  )}
                  {member.vocational_school && (
                    <InfoRow
                      label="Vocational School"
                      value={`${member.vocational_school}${member.vocational_year_graduated ? ` (${member.vocational_year_graduated})` : ''}`}
                    />
                  )}
                  {member.college && (
                    <InfoRow
                      label="College"
                      value={`${member.college}${member.college_year_graduated ? ` (${member.college_year_graduated})` : ''}`}
                    />
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Spiritual Information - Collapsible */}
            {hasSpiritualInfo && (
              <CollapsibleSection title="Spiritual Information">
                <div className="space-y-3">
                  {member.accepted_jesus !== null && (
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${member.accepted_jesus ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-sm text-gray-700">
                        {member.accepted_jesus ? 'Has accepted Jesus Christ' : 'Has not yet accepted Jesus Christ'}
                      </span>
                    </div>
                  )}
                  {member.spiritual_birthday && (
                    <InfoRow label="Spiritual Birthday" value={formatDate(member.spiritual_birthday)} />
                  )}
                  {member.willing_to_be_baptized !== null && (
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${member.willing_to_be_baptized ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                      <span className="text-sm text-gray-700">
                        {member.willing_to_be_baptized ? 'Willing to be baptized' : 'Not yet willing to be baptized'}
                      </span>
                    </div>
                  )}
                  {member.salvation_testimony && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Salvation Testimony</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.salvation_testimony}</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Church Background - Collapsible */}
            {hasChurchBackground && (
              <CollapsibleSection title="Church Background">
                <div className="space-y-2">
                  {member.previous_church && (
                    <InfoRow label="Previous Church" value={member.previous_church} />
                  )}
                  {member.began_attending_since && (
                    <InfoRow label="Began Attending Since" value={formatDate(member.began_attending_since)} />
                  )}
                  {member.how_introduced && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">How They Were Introduced</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.how_introduced}</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Family Members - Collapsible */}
            {member.family_members && member.family_members.length > 0 && (
              <CollapsibleSection title="Family Members">
                <div className="divide-y divide-gray-100">
                  {member.family_members.map((family, index) => (
                    <div key={family.id || index} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-purple-100">
                          <HiOutlineUserGroup className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{family.name}</p>
                          <p className="text-xs text-gray-500">
                            {family.relationship}
                            {family.birthdate && ` • Born ${formatDate(family.birthdate)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

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
              onClick={handleExportMembershipForm}
              disabled={exportingForm}
              className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                exportingForm ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {exportingForm ? (
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
              Export Membership Form
            </button>
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
              Export Member Report
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