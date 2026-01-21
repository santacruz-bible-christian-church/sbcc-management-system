import { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { useMinistries } from '../../ministries/hooks/useMinistries';
import { AUDIENCE_OPTIONS } from '../utils/constants';

const AnnouncementModal = ({ isOpen, onClose, onSubmit, announcement = null, submitting = false }) => {
  const { ministries, loading: loadingMinistries } = useMinistries();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all',
    ministry: '',
    publish_at: '',
    expire_at: '',
    is_active: true,
  });

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        body: announcement.body || '',
        audience: announcement.audience || 'all',
        ministry: announcement.ministry || '',
        publish_at: announcement.publish_at ? new Date(announcement.publish_at).toISOString().slice(0, 16) : '',
        expire_at: announcement.expire_at ? new Date(announcement.expire_at).toISOString().slice(0, 16) : '',
        is_active: announcement.is_active ?? true,
      });
    } else {
      // Default to current time for new announcements
      const now = new Date().toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, publish_at: now }));
    }
  }, [announcement]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission

    const submitData = {
      title: formData.title,
      body: formData.body,
      audience: formData.audience,
      ministry: formData.audience === 'ministry' ? parseInt(formData.ministry) : null,
      publish_at: new Date(formData.publish_at).toISOString(),
      expire_at: formData.expire_at ? new Date(formData.expire_at).toISOString() : null,
      is_active: formData.is_active,
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {announcement ? 'Edit Announcement' : 'New Announcement'}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter announcement title"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              required
              rows={6}
              disabled={submitting}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter announcement message"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audience *
            </label>
            <select
              required
              disabled={submitting}
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value, ministry: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ministry (conditional) */}
          {formData.audience === 'ministry' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ministry *
              </label>
              <select
                required
                value={formData.ministry}
                onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loadingMinistries || submitting}
              >
                <option value="">Select ministry...</option>
                {ministries?.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publish Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              disabled={submitting}
              value={formData.publish_at}
              onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] cursor-text disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Expire Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expire Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              disabled={submitting}
              value={formData.expire_at}
              onChange={(e) => setFormData({ ...formData, expire_at: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB54A] cursor-text disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              disabled={submitting}
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#FDB54A] border-gray-300 rounded focus:ring-[#FDB54A] disabled:cursor-not-allowed"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6C67E] font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {announcement ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{announcement ? 'Update' : 'Create'} Announcement</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
