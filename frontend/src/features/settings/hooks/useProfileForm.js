import { useState, useCallback } from 'react';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

/**
 * Hook for managing profile form state and submission
 */
export const useProfileForm = (user, onSuccess) => {
  const updateUser = useAuthStore((state) => state.updateUser);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  }, [error, success]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    try {
      await authApi.updateProfile(formData);
      await updateUser();
      setSuccess('Profile updated successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      const message = err.response?.data?.email?.[0]
        || err.response?.data?.detail
        || 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [formData, updateUser, onSuccess]);

  return {
    formData,
    saving,
    success,
    error,
    handleChange,
    handleSubmit,
  };
};

export default useProfileForm;
