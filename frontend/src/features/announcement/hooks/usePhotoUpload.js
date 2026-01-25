import { useState, useCallback } from 'react';

export function usePhotoUpload() {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handlePhotoSelect = useCallback((file) => {
    setPhotoError(null);

    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Please upload a valid image (JPG, PNG, or WebP)');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPhotoError('Image size must be less than 5MB');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setPhotoFile(file);
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    handlePhotoSelect(file);
  }, [handlePhotoSelect]);

  const clearPhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
  }, []);

  return {
    photoFile,
    photoPreview,
    photoError,
    handlePhotoChange,
    handlePhotoSelect,
    clearPhoto,
  };
}
