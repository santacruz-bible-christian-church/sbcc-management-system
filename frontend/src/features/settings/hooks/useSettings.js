// frontend/src/features/settings/hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '../../../api/settings.api';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.response?.data?.detail || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (data) => {
    setSaving(true);
    try {
      const updatedSettings = await settingsApi.updateSettings(data);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadImage = useCallback(async (field, file) => {
    setSaving(true);
    try {
      const updatedSettings = await settingsApi.uploadImage(field, file);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeImage = useCallback(async (field) => {
    setSaving(true);
    try {
      const updatedSettings = await settingsApi.removeImage(field);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    saving,
    refresh: fetchSettings,
    updateSettings,
    uploadImage,
    removeImage,
  };
};
