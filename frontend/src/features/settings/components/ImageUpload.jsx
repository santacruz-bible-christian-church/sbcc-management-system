import { useState, useRef } from 'react';
import { HiOutlineUpload, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi';
import { IconButton } from '../../../components/ui/Button';
import { showWarning } from '../../../utils/toast';

export const ImageUpload = ({
  label,
  currentImage,
  onUpload,
  onRemove,
  helpText,
  accept = "image/png,image/jpeg,image/jpg",
  disabled = false
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showWarning('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call upload handler
    onUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-sbcc-primary bg-blue-50'
            : preview
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          // Preview
          <div className="relative group">
            <img
              src={preview}
              alt={label}
              className="max-h-48 mx-auto rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) fileInputRef.current?.click();
                  }}
                  disabled={disabled}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                  title="Change image"
                >
                  <HiOutlineUpload className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  disabled={disabled}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <HiOutlineTrash className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Upload area
          <div className="text-center">
            <HiOutlinePhotograph className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-sbcc-primary">Click to upload</span> or drag and drop
              </p>
              {helpText && (
                <p className="text-xs text-gray-500 mt-1">{helpText}</p>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </div>
  );
};
