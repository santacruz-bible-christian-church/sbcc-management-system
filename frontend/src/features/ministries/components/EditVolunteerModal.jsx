import { useState, useEffect } from 'react';
import { ministriesApi } from '../../../api/ministries.api';
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

export const EditVolunteerModal = ({ open, onClose, member, onSuccess }) => {
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const { existingLeader, loading: loadingValidation, checkExistingLeader, canAssignLead, getLeaderName } = useLeaderValidation();

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

      if (Array.isArray(member.available_days)) {
        setSelectedDays(member.available_days);
      } else {
        setSelectedDays([]);
      }

      if (member.ministry) {
        checkExistingLeader(member.ministry, member.id);
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

    if (!canAssignLead(formData.role)) {
      showError(`Cannot assign lead role. ${getLeaderName()} is already the lead for this ministry.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ministry: member.ministry,
        user_id: member.user.id,
        role: formData.role,
        is_active: formData.is_active,
        max_consecutive_shifts: Number(formData.max_consecutive_shifts),
        available_days: selectedDays.length > 0 ? selectedDays : [],
      };

      await ministriesApi.updateMember(member.id, payload);
      showSuccess('Volunteer updated successfully!');
      onSuccess();
    } catch (err) {
      console.error('Update volunteer error:', err);
      let errorMsg = 'Failed to update volunteer';
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

  if (!open || !member) return null;

  const userName = member.user
    ? `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || member.user.username || 'Unknown'
    : 'Unknown User';

  const userEmail = member.user?.email || 'No email';
  const isLeadBlocked = !canAssignLead(formData.role);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Volunteer</h2>
              <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Member Info */}
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
                  disabled={loading || loadingValidation}
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
                        {getLeaderName()} is already the lead. Change their role first.
                      </p>
                    </div>
                  </div>
                )}

                {formData.role === 'lead' && !existingLeader && !loadingValidation && member.role !== 'lead' && (
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
                        disabled={loading}
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
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                />
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
                <SecondaryButton type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  disabled={loading || isLeadBlocked || loadingValidation}
                >
                  {loading ? 'Updating...' : 'Update Volunteer'}
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

export default EditVolunteerModal;
