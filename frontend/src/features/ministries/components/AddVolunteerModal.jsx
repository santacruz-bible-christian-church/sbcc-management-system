import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
import { membersApi } from '../../../api/members.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import { HiX } from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';

// Match backend ROLE_CHOICES exactly
const ROLES = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'lead', label: 'Lead' },
  { value: 'usher', label: 'Usher' },
  { value: 'worship', label: 'Worship' },
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

      // Fetch members who belong to THIS ministry as their primary ministry
      const membersResponse = await membersApi.listMembers({
        ministry: ministry.id,  // ← Filter by primary ministry
        is_active: true,
        status: 'active',
        page_size: 1000
      });

      const ministryMembers = Array.isArray(membersResponse)
        ? membersResponse
        : membersResponse.results || [];

      console.log(`Members with ${ministry.name} as primary ministry:`, ministryMembers.length);

      // Fetch current ministry volunteers (MinistryMember records)
      const volunteersResponse = await ministriesApi.listMembers({
        ministry: ministry.id
      });

      const currentVolunteers = Array.isArray(volunteersResponse)
        ? volunteersResponse
        : volunteersResponse.results || [];

      console.log('Current volunteers in ministry:', currentVolunteers.length);

      // Extract user IDs from current volunteers
      const currentVolunteerUserIds = currentVolunteers
        .filter(v => v.user && v.user.id)
        .map(v => v.user.id);

      console.log('Current volunteer user IDs:', currentVolunteerUserIds);

      // Filter out members who are already volunteers
      const availableMembers = ministryMembers.filter(
        member => !currentVolunteerUserIds.includes(member.user)
      );

      console.log('Available members to add as volunteers:', availableMembers.length);
      console.log('Available members:', availableMembers.map(m => ({
        id: m.id,
        user: m.user,
        name: `${m.first_name} ${m.last_name}`,
        email: m.email
      })));

      setMembers(availableMembers);
    } catch (err) {
      console.error('Failed to fetch members:', err);
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

      console.log('=== SUBMITTING VOLUNTEER ===');
      console.log('Payload:', payload);

      await ministriesApi.createMember(payload);

      showSuccess('Volunteer added successfully!');

      // Reset form
      setFormData({
        user: '',
        role: 'volunteer',
        is_active: true,
        max_consecutive_shifts: '2',
      });
      setSelectedDays([]);

      // Call success callback to refresh parent
      onSuccess();

    } catch (err) {
      console.error('=== ADD VOLUNTEER ERROR ===');
      console.error('Error:', err);
      console.error('Response data:', err.response?.data);

      // Extract error message
      let errorMsg = 'Failed to add volunteer';
      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.user_id) {
          errorMsg = Array.isArray(errorData.user_id)
            ? errorData.user_id[0]
            : errorData.user_id;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
        } else if (errorData.ministry) {
          errorMsg = Array.isArray(errorData.ministry)
            ? errorData.ministry[0]
            : errorData.ministry;
        } else {
          // Get first error from any field
          const firstError = Object.values(errorData)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }

      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (!loading && e.target === e.currentTarget) {
      onClose();
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

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
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
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
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
                      All members of <span className="font-semibold">{ministry?.name}</span> are already volunteers,
                      or there are no active members assigned to this ministry.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-yellow-700">
                        💡 <strong>Tip:</strong> To add more volunteers:
                      </p>
                      <ol className="text-xs text-yellow-700 ml-4 list-decimal space-y-0.5">
                        <li>Go to the Members page</li>
                        <li>Assign members to {ministry?.name} as their primary ministry</li>
                        <li>Then come back here to add them as volunteers</li>
                      </ol>
                    </div>
                    <button
                      type="button"
                      onClick={fetchMembers}
                      className="mt-3 text-xs text-yellow-800 underline hover:text-yellow-900 font-medium"
                    >
                      🔄 Refresh member list
                    </button>
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
                <p className="mt-1 text-xs text-gray-500">
                  Only showing members who belong to <span className="font-medium">{ministry?.name}</span> as their primary ministry
                </p>
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
                  disabled={loading || members.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label
                      key={day}
                      className={`flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer ${
                        loading || members.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
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
                <p className="mt-1 text-sm text-gray-500">
                  Select days when this volunteer is available to serve (leave unchecked for any day)
                </p>
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
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of consecutive shifts this volunteer can serve (1-10)
                </p>
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
                <SecondaryButton
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading || members.length === 0 || loadingMembers}
                >
                  {loading ? 'Adding...' : 'Add Volunteer'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Snackbar */}
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
