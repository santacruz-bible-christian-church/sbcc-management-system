import { useState, useEffect } from 'react';
import { HiOutlineSave, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa';
import { PrimaryButton } from '../../../components/ui/Button';

export const ContactTab = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    email: '',
    facebook_url: '',
    youtube_url: '',
    instagram_url: '',
    service_schedule: '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        facebook_url: settings.facebook_url || '',
        youtube_url: settings.youtube_url || '',
        instagram_url: settings.instagram_url || '',
        service_schedule: settings.service_schedule || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, false);
    setHasChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <HiOutlineLocationMarker className="w-4 h-4" />
                Address
              </div>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="123 Church Street, City, Province"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <HiOutlinePhone className="w-4 h-4" />
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                placeholder="+63 912 345 6789"
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <HiOutlineMail className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
                placeholder="info@church.org"
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaFacebook className="w-4 h-4 text-blue-600" />
                Facebook Page
              </div>
            </label>
            <input
              type="url"
              id="facebook_url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="https://facebook.com/yourchurch"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="youtube_url" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaYoutube className="w-4 h-4 text-red-600" />
                YouTube Channel
              </div>
            </label>
            <input
              type="url"
              id="youtube_url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="https://youtube.com/@yourchurch"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaInstagram className="w-4 h-4 text-pink-600" />
                Instagram Profile
              </div>
            </label>
            <input
              type="url"
              id="instagram_url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
              placeholder="https://instagram.com/yourchurch"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* Service Schedule */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Schedule</h3>

        <div>
          <label htmlFor="service_schedule" className="block text-sm font-medium text-gray-700 mb-2">
            Weekly Service Times
          </label>
          <textarea
            id="service_schedule"
            name="service_schedule"
            value={formData.service_schedule}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
            placeholder="Sunday Worship: 9:00 AM & 11:00 AM&#10;Wednesday Prayer: 7:00 PM&#10;Friday Youth Service: 7:30 PM"
            disabled={saving}
          />
          <p className="text-xs text-gray-500 mt-2">
            List your regular service schedule (one per line)
          </p>
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
