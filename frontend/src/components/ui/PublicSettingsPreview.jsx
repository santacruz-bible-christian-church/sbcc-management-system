// frontend/src/components/ui/PublicSettingsPreview.jsx
import { useState, useEffect } from 'react';
import { settingsApi } from '../../api/settings.api';

export const PublicSettingsPreview = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getPublicSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  if (!settings) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold">Current Settings Preview</h3>

      {/* Branding */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Branding</h4>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">App Name:</span> {settings.app_name}</p>
          <p><span className="font-medium">Church Name:</span> {settings.church_name}</p>
          {settings.tagline && <p><span className="font-medium">Tagline:</span> {settings.tagline}</p>}
          {settings.logo && (
            <div>
              <span className="font-medium">Logo:</span>
              <img src={settings.logo} alt="Logo" className="mt-1 h-16" />
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-medium text-sm text-gray-700 mb-2">Contact</h4>
        <div className="space-y-1 text-sm">
          {settings.address && <p>{settings.address}</p>}
          {settings.phone && <p>📞 {settings.phone}</p>}
          {settings.email && <p>✉️ {settings.email}</p>}
        </div>
      </div>
    </div>
  );
};
