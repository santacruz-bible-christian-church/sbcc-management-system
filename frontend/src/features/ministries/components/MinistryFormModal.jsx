import { useCallback, useEffect, useState } from "react";
import { HiX } from "react-icons/hi";

export const MinistryFormModal = ({
  open,
  ministry,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leader_id: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ministry) {
      setFormData({
        name: ministry.name || "",
        description: ministry.description || "",
        leader_id: ministry.leader?.id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        leader_id: "",
      });
    }
    setErrors({});
  }, [ministry, open]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Ministry name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        const submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
        };

        // Only include leader_id if it's set
        if (formData.leader_id) {
          submitData.leader_id = parseInt(formData.leader_id);
        }

        await onSubmit(submitData);
        onClose();
      } catch (err) {
        console.error("Form submission error:", err);
      }
    },
    [formData, onSubmit, onClose]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              {ministry ? "Edit Ministry" : "Create New Ministry"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Ministry Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Music Ministry"
                disabled={loading}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent transition-all resize-none"
                placeholder="Brief description of the ministry..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Note about leader */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Ministry leaders can be assigned later from
                the ministry details page.
              </p>
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-sbcc-primary text-white rounded-lg hover:bg-sbcc-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {ministry ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  ministry ? "Update Ministry" : "Create Ministry"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MinistryFormModal;
