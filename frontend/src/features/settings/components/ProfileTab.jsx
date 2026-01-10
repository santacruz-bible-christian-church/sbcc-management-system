import { HiEye, HiEyeOff, HiExclamationCircle, HiCheckCircle, HiCamera, HiTrash } from 'react-icons/hi';
import { useProfilePicture } from '../hooks/useProfilePicture';
import { useProfileForm } from '../hooks/useProfileForm';
import { usePasswordForm } from '../hooks/usePasswordForm';

export const ProfileTab = ({ user, saving, onProfileUpdate }) => {
  // Profile picture hook
  const picture = useProfilePicture(onProfileUpdate);

  // Profile form hook
  const profile = useProfileForm(user, onProfileUpdate);

  // Password form hook
  const password = usePasswordForm();

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

        {picture.error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {picture.error}
          </div>
        )}

        {picture.success && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {picture.success}
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
            {picture.uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <input
              ref={picture.fileInputRef}
              type="file"
              accept="image/*"
              onChange={picture.handleChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={picture.handleClick}
              disabled={picture.uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <HiCamera size={16} />
              {user?.profile_picture ? 'Change Photo' : 'Upload Photo'}
            </button>
            {user?.profile_picture && (
              <button
                type="button"
                onClick={picture.handleRemove}
                disabled={picture.uploading}
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

        {profile.error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {profile.error}
          </div>
        )}

        {profile.success && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {profile.success}
          </div>
        )}

        <form onSubmit={profile.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                value={profile.formData.first_name}
                onChange={(e) => profile.handleChange('first_name', e.target.value)}
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
                value={profile.formData.last_name}
                onChange={(e) => profile.handleChange('last_name', e.target.value)}
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
              value={profile.formData.email}
              onChange={(e) => profile.handleChange('email', e.target.value)}
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
              value={profile.formData.phone}
              onChange={(e) => profile.handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="+63 9XX XXX XXXX"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profile.saving || saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {profile.saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

        {password.error && (
          <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
            <HiExclamationCircle size={18} />
            {password.error}
          </div>
        )}

        {password.success && (
          <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <HiCheckCircle size={18} />
            {password.success}
          </div>
        )}

        <form onSubmit={password.handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="old_password"
                type={password.showOld ? 'text' : 'password'}
                value={password.formData.old_password}
                onChange={(e) => password.handleChange('old_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={password.toggleShowOld}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {password.showOld ? <HiEyeOff size={18} /> : <HiEye size={18} />}
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
                type={password.showNew ? 'text' : 'password'}
                value={password.formData.new_password}
                onChange={(e) => password.handleChange('new_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter new password (min 8 characters)"
              />
              <button
                type="button"
                onClick={password.toggleShowNew}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {password.showNew ? <HiEyeOff size={18} /> : <HiEye size={18} />}
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
                type={password.showConfirm ? 'text' : 'password'}
                value={password.formData.new_password2}
                onChange={(e) => password.handleChange('new_password2', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={password.toggleShowConfirm}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {password.showConfirm ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={password.saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {password.saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileTab;
