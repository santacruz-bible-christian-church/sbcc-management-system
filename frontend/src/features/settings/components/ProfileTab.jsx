import { useState, useRef } from 'react';
import { HiEye, HiEyeOff, HiExclamationCircle, HiCheckCircle, HiCamera, HiTrash } from 'react-icons/hi';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

export const ProfileTab = ({ user, saving, onProfileUpdate }) => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const fileInputRef = useRef(null);

  // Profile picture state
  const [pictureUploading, setPictureUploading] = useState(false);
  const [pictureError, setPictureError] = useState('');
  const [pictureSuccess, setPictureSuccess] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile picture handlers
  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPictureError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPictureError('Image must be less than 5MB');
      return;
    }

    setPictureError('');
    setPictureSuccess('');
    setPictureUploading(true);

    try {
      await authApi.uploadProfilePicture(file);
      await updateUser();
      setPictureSuccess('Profile picture updated');
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setPictureError(err.response?.data?.detail || 'Failed to upload picture');
    } finally {
      setPictureUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePicture = async () => {
    setPictureError('');
    setPictureSuccess('');
    setPictureUploading(true);

    try {
      await authApi.removeProfilePicture();
      await updateUser();
      setPictureSuccess('Profile picture removed');
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setPictureError(err.response?.data?.detail || 'Failed to remove picture');
    } finally {
      setPictureUploading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (profileError) setProfileError('');
    if (profileSuccess) setProfileSuccess('');
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validation
    if (!profileData.first_name.trim()) {
      setProfileError('First name is required');
      return;
    }
    if (!profileData.last_name.trim()) {
      setProfileError('Last name is required');
      return;
    }
    if (!profileData.email.trim()) {
      setProfileError('Email is required');
      return;
    }

    setProfileSaving(true);
    try {
      await authApi.updateProfile(profileData);
      // Refresh user data in auth store so sidebar and other components update
      await updateUser();
      setProfileSuccess('Profile updated successfully');
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      const message = err.response?.data?.email?.[0]
        || err.response?.data?.detail
        || 'Failed to update profile';
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.old_password) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.new_password) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.new_password !== passwordData.new_password2) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password2
      );
      setPasswordSuccess('Password changed successfully');
      setPasswordData({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      const message = err.response?.data?.old_password?.[0]
        || err.response?.data?.new_password?.[0]
        || err.response?.data?.detail
        || 'Failed to change password';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = user?.first_name?.[0] || '';
    const last = user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>

        {pictureError && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {pictureError}
          </div>
        )}

        {pictureSuccess && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {pictureSuccess}
          </div>
        )}

        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-semibold border-2 border-gray-200">
                {getInitials()}
              </div>
            )}
            {pictureUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handlePictureClick}
              disabled={pictureUploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <HiCamera size={16} />
              {user?.profile_picture ? 'Change Photo' : 'Upload Photo'}
            </button>
            {user?.profile_picture && (
              <button
                type="button"
                onClick={handleRemovePicture}
                disabled={pictureUploading}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiTrash size={16} />
                Remove
              </button>
            )}
          </div>

          {/* Help text */}
          <div className="text-sm text-gray-500">
            <p>Recommended: 200×200px</p>
            <p>Max size: 5MB</p>
            <p>Formats: JPG, PNG, GIF</p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>

        {profileError && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {profileError}
          </div>
        )}

        {profileSuccess && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                value={profileData.first_name}
                onChange={(e) => handleProfileChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                value={profileData.last_name}
                onChange={(e) => handleProfileChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+63 9XX XXX XXXX"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving || saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

        {passwordError && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="old_password"
                type={showOldPassword ? 'text' : 'password'}
                value={passwordData.old_password}
                onChange={(e) => handlePasswordChange('old_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter new password (min 8 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="new_password2" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="new_password2"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.new_password2}
                onChange={(e) => handlePasswordChange('new_password2', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {passwordSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
