import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiX } from 'react-icons/hi';

export const MemberFormModal = ({ open, onClose, onSubmit, member = null, loading, ministries }) => {
  const isEdit = !!member;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    ministry: '',
    membership_date: '',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        date_of_birth: member.date_of_birth || '',
        gender: member.gender || '',
        address: member.address || '',
        ministry: member.ministry || '',
        membership_date: member.membership_date || '',
        is_active: member.is_active !== undefined ? member.is_active : true, // Add this
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        ministry: '',
        membership_date: new Date().toISOString().split('T')[0],
        is_active: true, // Add this
      });
    }
    setErrors({});
  }, [member, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Handle checkbox
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      ministry: '',
      membership_date: '',
      is_active: true,
    });
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Edit Member' : 'Add New Member'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
                  placeholder="09123456789"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Ministry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ministry
                </label>
                <select
                  name="ministry"
                  value={formData.ministry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Ministry</option>
                  {ministries.map((ministry) => (
                    <option key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Membership Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membership Date
                </label>
                <input
                  type="date"
                  name="membership_date"
                  value={formData.membership_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Active Status Toggle - Full Width - Only show when editing */}
              {isEdit && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#FDB54A] border-gray-300 rounded focus:ring-[#FDB54A] focus:ring-2"
                      disabled={loading}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Active Member</p>
                      <p className="text-xs text-gray-500">
                        Uncheck to mark this member as inactive (they will still appear in records)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

MemberFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  member: PropTypes.object,
  loading: PropTypes.bool,
  ministries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MemberFormModal;
