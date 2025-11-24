import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { membersApi } from '../../../api/members.api';
import { useLeaderValidation } from '../hooks/useLeaderValidation';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX, HiExclamationCircle } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

const ROLES = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'lead', label: 'Lead' },
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const AddVolunteerModal = ({ open, onClose, ministry, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const { existingLeader, loading: loadingValidation, checkExistingLeader, canAssignLead, getLeaderName } = useLeaderValidation();

  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [formData, setFormData] = useState({
    user: '',
    role: 'volunteer',
    is_active: true,
    max_consecutive_shifts: '2',
  });

  useEffect(() => {
    if (open && ministry?.id) {
      fetchMembers();
      checkExistingLeader(ministry.id);
      // Reset form when modal opens
      setFormData({
        user: '',
        role: 'volunteer',
        is_active: true,
        max_consecutive_shifts: '2',
      });
      setSelectedDays([]);
    }
  }, [open, ministry?.id]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      console.log('=== FETCHING AVAILABLE MEMBERS ===');
      console.log('Ministry ID:', ministry.id);
      console.log('Ministry Name:', ministry.name);

      // Step 1: Fetch ALL members who have this ministry as primary
      const membersResponse = await membersApi.listMembers({
        ministry: ministry.id,
        is_active: true,
        status: 'active',
        page_size: 1000  // ← Fetch all members
      });

      const ministryMembers = Array.isArray(membersResponse)
        ? membersResponse
        : membersResponse.results || [];

      console.log(`📋 Found ${ministryMembers.length} members with ${ministry.name} as primary ministry`);

      // Step 2: Fetch ALL current volunteers (MinistryMember records)
      const volunteersResponse = await ministriesApi.listMembers({
        ministry: ministry.id,
        page_size: 1000  // ← Fetch all volunteers
      });

      const currentVolunteers = Array.isArray(volunteersResponse)
        ? volunteersResponse
        : volunteersResponse.results || [];

      console.log(`👥 Found ${currentVolunteers.length} current volunteers in ministry roster`);

      // Step 3: Extract user IDs from volunteers using Set for fast lookup
      const volunteerUserIds = new Set(
        currentVolunteers
          .filter(v => v.user && v.user.id)
          .map(v => v.user.id)
      );

      console.log('🔑 Volunteer user IDs:', Array.from(volunteerUserIds));

      // Step 4: Filter members - exclude those already in volunteer roster
      const availableMembers = ministryMembers.filter(member => {
        const memberUserId = member.user; // This is the user ID (number)
        const isAlreadyVolunteer = volunteerUserIds.has(memberUserId);

        if (isAlreadyVolunteer) {
          console.log(`❌ Filtering out ${member.first_name} ${member.last_name} (User ID: ${memberUserId}) - already a volunteer`);
        }

        return !isAlreadyVolunteer;
      });

      console.log('=== FILTERING COMPLETE ===');
      console.log(`🎯 ${availableMembers.length} members available to add as volunteers`);

      setMembers(availableMembers);
    } catch (err) {
      console.error('❌ Failed to fetch members:', err);
      console.error('Error details:', err.response?.data);
      showError('Failed to load members list');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.user) {
      showError('Please select a member');
      return;
    }

    if (!canAssignLead(formData.role)) {
      showError(`Cannot assign lead role. ${getLeaderName()} is already the lead for this ministry.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ministry: ministry.id,
        user_id: Number(formData.user),
        role: formData.role,
        is_active: formData.is_active,
        max_consecutive_shifts: Number(formData.max_consecutive_shifts),
        available_days: selectedDays.length > 0 ? selectedDays : [],
      };

      await ministriesApi.createMember(payload);
      showSuccess('Volunteer added successfully!');

      setFormData({
        user: '',
        role: 'volunteer',
        is_active: true,
        max_consecutive_shifts: '2',
      });
      setSelectedDays([]);
      onSuccess();
    } catch (err) {
      console.error('Add volunteer error:', err);
      let errorMsg = 'Failed to add volunteer';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.detail) errorMsg = errorData.detail;
        else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        } else {
          const firstError = Object.values(errorData)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        user: '',
        role: 'volunteer',
        is_active: true,
        max_consecutive_shifts: '2',
      });
      setSelectedDays([]);
      onClose();
    }
  };

  if (!open) return null;

  const isLeadBlocked = !canAssignLead(formData.role);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Volunteer</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add a volunteer from <span className="font-semibold">{ministry?.name}</span> members
                </p>
              </div>
              <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member <span className="text-red-500">*</span>
                </label>
                {loadingMembers ? (
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-sbcc-primary border-t-transparent mr-2"></div>
                    <span className="text-sm text-gray-600">Loading members...</span>
                  </div>
                ) : members.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">No available members to add</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      All members of <span className="font-semibold">{ministry?.name}</span> are already volunteers.
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.user}
                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                  >
                    <option value="">Choose a member...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.user}>
                        {member.first_name} {member.last_name} ({member.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={loading || members.length === 0 || loadingValidation}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>

                {/* Validation Messages */}
                {loadingValidation && formData.role === 'lead' && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                    <span>Checking for existing leader...</span>
                  </div>
                )}

                {isLeadBlocked && !loadingValidation && (
                  <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Cannot assign Lead role</p>
                      <p className="text-sm text-red-700 mt-1">
                        {getLeaderName()} is already the lead for this ministry.
                      </p>
                    </div>
                  </div>
                )}

                {formData.role === 'lead' && !existingLeader && !loadingValidation && (
                  <div className="mt-2 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <HiExclamationCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Assigning as Lead</p>
                      <p className="text-sm text-green-700 mt-1">This volunteer will become the ministry leader.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        disabled={loading || members.length === 0}
                        className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Consecutive Shifts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Consecutive Shifts <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_consecutive_shifts}
                  onChange={(e) => setFormData({ ...formData, max_consecutive_shifts: e.target.value })}
                  required
                  disabled={loading || members.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  disabled={loading || members.length === 0}
                  className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active volunteer (can be assigned to shifts)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <SecondaryButton type="button" onClick={handleClose} disabled={loading}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading || members.length === 0 || loadingMembers || isLeadBlocked || loadingValidation}
                >
                  {loading ? 'Adding...' : 'Add Volunteer'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </>
  );
};

export default AddVolunteerModal;
