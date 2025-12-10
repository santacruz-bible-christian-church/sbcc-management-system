import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { HiX, HiUpload, HiTrash, HiDocument } from 'react-icons/hi';

export const MeetingMinutesModal = ({
  open,
  meeting = null,
  categories = [],
  onSave,
  onCancel,
  onUploadAttachment,
  onDeleteAttachment,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: '',
    category: 'general',
    content: '',
    attendees: '',
  });
  const [errors, setErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!meeting;

  // Populate form when editing
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        meeting_date: meeting.meeting_date || '',
        category: meeting.category || 'general',
        content: meeting.content || '',
        attendees: meeting.attendees || '',
      });
    } else {
      setFormData({
        title: '',
        meeting_date: new Date().toISOString().split('T')[0],
        category: 'general',
        content: '',
        attendees: '',
      });
    }
    setErrors({});
  }, [meeting, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.meeting_date) newErrors.meeting_date = 'Meeting date is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave(formData);
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !meeting?.id) return;

    try {
      setUploadingFile(true);
      await onUploadAttachment(meeting.id, file);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Meeting Minutes' : 'New Meeting Minutes'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent outline-none transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter meeting title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Date and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="meeting_date"
                    value={formData.meeting_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent outline-none transition-all ${
                      errors.meeting_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.meeting_date && (
                    <p className="mt-1 text-sm text-red-500">{errors.meeting_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent outline-none transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                <input
                  type="text"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent outline-none transition-all"
                  placeholder="List of attendees (comma separated)"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent outline-none transition-all resize-none ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter meeting notes, decisions, action items..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
              </div>

              {/* Attachments Section - Only show when editing */}
              {isEditing && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                    <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <HiUpload className="w-4 h-4" />
                      <span className="text-sm">{uploadingFile ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </label>
                  </div>

                  {meeting.attachments?.length > 0 ? (
                    <div className="space-y-2">
                      {meeting.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <HiDocument className="w-5 h-5 text-gray-500" />
                            <div>
                              <a
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                {attachment.file_name}
                              </a>
                              <p className="text-xs text-gray-500">
                                {attachment.file_type?.toUpperCase()} •{' '}
                                {attachment.file_size_mb
                                  ? `${attachment.file_size_mb} MB`
                                  : `${Math.round(attachment.file_size / 1024)} KB`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onDeleteAttachment(attachment.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete attachment"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      No attachments yet. Upload files to attach to this meeting.
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Meeting'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

MeetingMinutesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  meeting: PropTypes.object,
  categories: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUploadAttachment: PropTypes.func,
  onDeleteAttachment: PropTypes.func,
  loading: PropTypes.bool,
};

export default MeetingMinutesModal;
