import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
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

export const EditVolunteerModal = ({ open, onClose, member, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [formData, setFormData] = useState({
    role: 'volunteer',
    is_active: true,
    max_consecutive_shifts: '2',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        role: member.role || 'volunteer',
        is_active: member.is_active !== undefined ? member.is_active : true,
        max_consecutive_shifts: member.max_consecutive_shifts?.toString() || '2',
      });

      // Parse available_days - it might be array or null
      if (Array.isArray(member.available_days)) {
        setSelectedDays(member.available_days);
      } else {
        setSelectedDays([]);
      }
    }
  }, [member]);

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

    if (!member) return;

    setLoading(true);

    try {
      // Include all required fields for update
      const payload = {
        ministry: member.ministry, // ← Add ministry ID
        user_id: member.user.id,   // ← Add user ID
        role: formData.role,
        is_active: formData.is_active,
        max_consecutive_shifts: Number(formData.max_consecutive_shifts),
        available_days: selectedDays.length > 0 ? selectedDays : [],
      };

      console.log('=== UPDATING VOLUNTEER ===');
      console.log('Member ID:', member.id);
      console.log('Payload:', payload);

      await ministriesApi.updateMember(member.id, payload);
      showSuccess('Volunteer updated successfully!');
      onSuccess();
    } catch (err) {
      console.error('=== UPDATE VOLUNTEER ERROR ===');
      console.error('Error:', err);
      console.error('Error response:', err.response?.data);

      // Extract error message
      let errorMsg = 'Failed to update volunteer';
      if (err.response?.data) {
        const errorData = err.response.data;

        if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMsg = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
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

  if (!open || !member) return null;

  // Extract user info safely
  const userName = member.user
    ? `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || member.user.username || 'Unknown'
    : 'Unknown User';

  const userEmail = member.user?.email || 'No email';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Volunteer</h2>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Member Info (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Member</p>
                <p className="text-lg font-semibold text-gray-900">{userName}</p>
                <p className="text-sm text-gray-600">{userEmail}</p>
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
                  disabled={loading}
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
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        disabled={loading}
                        className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary"
                      />
                      <span className="text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Select days when this volunteer is available to serve
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
                  disabled={loading}
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
                  id="is_active_edit"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  disabled={loading}
                  className="rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary"
                />
                <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
                  Active volunteer (can be assigned to shifts)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <SecondaryButton
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={loading} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Volunteer'}
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

export default EditVolunteerModal;
