import { useState, useEffect } from 'react';
import { HiX, HiUserAdd } from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';

export function ConvertToMemberModal({ open, onClose, visitor, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    date_of_birth: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visitor) {
      setFormData({
        date_of_birth: '',
        phone: visitor.phone || '',
        email: visitor.email || '',
      });
    }
    setErrors({});
  }, [visitor, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(visitor.id, formData);
      onClose();
    } catch (err) {
      console.error('Error converting visitor:', err);
      setErrors({
        submit:
          err.response?.data?.error ||
          err.response?.data?.detail ||
          'Failed to convert visitor to member',
      });
    }
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!open || !visitor) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleBackdrop}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true"></div>

        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <HiUserAdd className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Convert to Member</h2>
                <p className="text-sm text-gray-500">{visitor.full_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                Converting <strong>{visitor.full_name}</strong> will create a new Member
                record. This action cannot be undone.
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100 ${
                  errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter phone number"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent disabled:bg-gray-100 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                If no email provided, a placeholder will be generated.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <SecondaryButton type="button" onClick={onClose} disabled={loading}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={loading}>
                <HiUserAdd className="w-4 h-4 mr-1" />
                Convert to Member
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConvertToMemberModal;
