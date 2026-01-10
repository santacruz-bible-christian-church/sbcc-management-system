import { useState, useCallback } from 'react';
import { authApi } from '../../../api/auth.api';

/**
 * Hook for managing password change form
 */
export const usePasswordForm = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  }, [error, success]);

  const toggleShowOld = useCallback(() => setShowOld(prev => !prev), []);
  const toggleShowNew = useCallback(() => setShowNew(prev => !prev), []);
  const toggleShowConfirm = useCallback(() => setShowConfirm(prev => !prev), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.old_password) {
      setError('Current password is required');
      return;
    }
    if (!formData.new_password) {
      setError('New password is required');
      return;
    }
    if (formData.new_password.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (formData.new_password !== formData.new_password2) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(
        formData.old_password,
        formData.new_password,
        formData.new_password2
      );
      setSuccess('Password changed successfully');
      setFormData({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      const message = err.response?.data?.old_password?.[0]
        || err.response?.data?.new_password?.[0]
        || err.response?.data?.detail
        || 'Failed to change password';
      setError(message);
    } finally {
      setSaving(false);
    }
  }, [formData]);

  return {
    formData,
    showOld,
    showNew,
    showConfirm,
    saving,
    success,
    error,
    handleChange,
    handleSubmit,
    toggleShowOld,
    toggleShowNew,
    toggleShowConfirm,
  };
};

export default usePasswordForm;
