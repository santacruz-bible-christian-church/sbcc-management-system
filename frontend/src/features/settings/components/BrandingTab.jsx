import { useState, useEffect } from 'react';
import { HiOutlineSave } from 'react-icons/hi';
import { PrimaryButton } from '../../../components/ui/Button';
import { ImageUpload } from './ImageUpload';

export const BrandingTab = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    app_name: '',
    church_name: '',
    tagline: '',
  });

  const [imageUploads, setImageUploads] = useState({
    logo: null,
    login_background: null,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        app_name: settings.app_name || '',
        church_name: settings.church_name || '',
        tagline: settings.tagline || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleImageUpload = async (field, file) => {
    setImageUploads(prev => ({ ...prev, [field]: file }));
    // Immediately upload the image
    await onSave({ [field]: file }, true);
  };

  const handleImageRemove = async (field) => {
    setImageUploads(prev => ({ ...prev, [field]: null }));
    // Immediately remove the image
    await onSave({ [field]: null }, true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, false);
    setHasChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="app_name" className="block text-sm font-medium text-gray-700 mb-1">
              Application Name
            </label>
            <input
              type="text"
              id="app_name"
              name="app_name"
              value={formData.app_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="SBCC Management System"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed in the browser tab and main header
            </p>
          </div>

          <div>
            <label htmlFor="church_name" className="block text-sm font-medium text-gray-700 mb-1">
              Church Name
            </label>
            <input
              type="text"
              id="church_name"
              name="church_name"
              value={formData.church_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="Santa Cruz Bible Christian Church"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Full church name displayed throughout the system
            </p>
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <textarea
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="Growing in Faith Together"
              disabled={saving}
            />
            <p className="text-xs text-gray-500 mt-1">
              Church tagline or slogan
            </p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Images & Branding</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Church Logo"
            currentImage={settings?.logo}
            onUpload={(file) => handleImageUpload('logo', file)}
            onRemove={() => handleImageRemove('logo')}
            helpText="Recommended: 200x200px PNG with transparent background"
            disabled={saving}
          />

          <ImageUpload
            label="Login Background"
            currentImage={settings?.login_background}
            onUpload={(file) => handleImageUpload('login_background', file)}
            onRemove={() => handleImageRemove('login_background')}
            helpText="Recommended: 1920x1080px for login page background"
            disabled={saving}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div>
          {hasChanges && (
            <p className="text-sm text-amber-600">You have unsaved changes</p>
          )}
        </div>
        <PrimaryButton
          type="submit"
          icon={HiOutlineSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </form>
  );
};
