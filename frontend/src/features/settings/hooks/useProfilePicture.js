import { useState, useRef, useCallback } from 'react';
import { authApi } from '../../../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

/**
 * Hook for managing profile picture upload/remove
 */
export const useProfilePicture = (onSuccess) => {
  const updateUser = useAuthStore((state) => state.updateUser);
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await authApi.uploadProfilePicture(file);
      await updateUser();
      setSuccess('Profile picture updated');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [updateUser, onSuccess]);

  const handleRemove = useCallback(async () => {
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await authApi.removeProfilePicture();
      await updateUser();
      setSuccess('Profile picture removed');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove picture');
    } finally {
      setUploading(false);
    }
  }, [updateUser, onSuccess]);

  return {
    fileInputRef,
    uploading,
    error,
    success,
    handleClick,
    handleChange,
    handleRemove,
  };
};

export default useProfilePicture;
