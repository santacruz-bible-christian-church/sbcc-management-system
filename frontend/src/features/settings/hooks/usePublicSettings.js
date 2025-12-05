import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../../../api/settings.api';

// Global event emitter for settings changes
const settingsEvents = new EventTarget();

export const refreshPublicSettings = () => {
  settingsEvents.dispatchEvent(new Event('settings-updated'));
};

export const usePublicSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsApi.getPublicSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load public settings:', err);
      // Use defaults if fetch fails
      setSettings({
        app_name: 'SBCC Management',
        church_name: 'Santa Cruz Bible Christian Church',
        logo: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for settings update events
    const handleUpdate = () => {
      fetchSettings();
    };

    settingsEvents.addEventListener('settings-updated', handleUpdate);

    return () => {
      settingsEvents.removeEventListener('settings-updated', handleUpdate);
    };
  }, [fetchSettings]);

  return { settings, loading, refresh: fetchSettings };
};
