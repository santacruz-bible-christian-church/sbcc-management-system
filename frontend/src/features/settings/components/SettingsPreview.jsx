import { HiRefresh } from 'react-icons/hi';
import { IconButton } from '../../../components/ui/Button';

export const SettingsPreview = ({ settings, onRefresh, loading }) => {
  if (!settings) return null;

  return (
    <div className="bg-white rounded-lg border-2 border-blue-200 shadow-lg sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
        </div>
        <IconButton
          icon={HiRefresh}
          onClick={onRefresh}
          disabled={loading}
          className={`text-gray-600 hover:text-blue-600 ${loading ? 'animate-spin' : ''}`}
          title="Refresh preview"
        />
      </div>

      {/* Preview Content */}
      <div className="p-4 space-y-6">
        {/* Branding Section */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Branding
          </h4>

          {/* Logo */}
          {settings.logo && (
            <div className="mb-3">
              <img
                src={settings.logo}
                alt="Church Logo"
                className="h-16 w-auto object-contain rounded-lg border border-gray-200 bg-white p-2"
              />
            </div>
          )}

          {/* Text Info */}
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Application Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {settings.app_name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Church Name</p>
              <p className="text-sm font-semibold text-gray-900">
                {settings.church_name || 'Not set'}
              </p>
            </div>

            {settings.tagline && (
              <div>
                <p className="text-xs text-gray-500">Tagline</p>
                <p className="text-sm italic text-gray-700">
                  "{settings.tagline}"
                </p>
              </div>
            )}
          </div>

          {/* Other Images */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {settings.login_background && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Login BG</p>
                <div className="aspect-square bg-gray-100 rounded border border-gray-200 overflow-hidden">
                  <img
                    src={settings.login_background}
                    alt="Login Background"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        {(settings.address || settings.phone || settings.email) && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contact Info
            </h4>
            <div className="space-y-2 text-sm">
              {settings.address && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">📍</span>
                  <p className="text-gray-700 text-xs">{settings.address}</p>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <p className="text-gray-700 text-xs">{settings.phone}</p>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">✉️</span>
                  <p className="text-gray-700 text-xs">{settings.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media */}
        {(settings.facebook_url || settings.youtube_url || settings.instagram_url) && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Social Media
            </h4>
            <div className="flex gap-2">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                  title="Facebook"
                >
                  <span className="text-xs">f</span>
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                  title="YouTube"
                >
                  <span className="text-xs">▶</span>
                </a>
              )}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="Instagram"
                >
                  <span className="text-xs">📷</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Service Schedule */}
        {settings.service_schedule && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Service Schedule
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-line border border-gray-200">
              {settings.service_schedule}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {settings.updated_at && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </p>
            {settings.updated_by_name && (
              <p className="text-xs text-gray-500">
                By: {settings.updated_by_name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
