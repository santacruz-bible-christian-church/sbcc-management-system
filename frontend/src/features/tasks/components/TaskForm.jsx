import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMembers } from '../../members/hooks/useMembers';

export const TaskForm = ({ initialValues, onSubmit, onCancel, submitting }) => {
  const { user } = useAuth();
  const { members } = useMembers(); // Fetch members for assignment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    start_date: '',
    end_date: '',
    assigned_to: '',
    ministry: '',
    notes: '',
    ...initialValues,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean up data before submit - convert empty strings to null for FK fields
      const cleanedData = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        ministry: formData.ministry || null,
      };
      onSubmit(cleanedData);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sbcc-orange/20 focus:border-sbcc-orange transition-all outline-none text-gray-900 placeholder-gray-400";
  const selectClasses = `${inputClasses} appearance-none pr-10`; // Added pr-10 for icon space
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Info Section */}
      <div className="space-y-6">
        <div>
          <label className={labelClasses}>
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputClasses}
            placeholder="e.g., Update Website Homepage"
          />
          {errors.title && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.title}</p>}
        </div>

        <div>
          <label className={labelClasses}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={inputClasses}
            placeholder="Describe the task details..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority */}
        <div>
          <label className={labelClasses}>
            Priority Level
          </label>
          <div className="relative">
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelClasses}>
            Current Status
          </label>
          <div className="relative">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="pending">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-5">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Schedule & Assignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`${inputClasses} bg-white`}
            />
            {errors.start_date && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.start_date}</p>}
          </div>

          <div>
            <label className={labelClasses}>
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={`${inputClasses} bg-white`}
            />
            {errors.end_date && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.end_date}</p>}
          </div>

          {/* Assigned To */}
          <div className="md:col-span-2">
            <label className={labelClasses}>
              Assigned To
            </label>
            <div className="relative">
              <select
                name="assigned_to"
                value={formData.assigned_to || ''}
                onChange={handleChange}
                className={`${selectClasses} bg-white`}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClasses}>
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={inputClasses}
          placeholder="Any extra information..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gradient-to-r from-sbcc-orange to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all transform active:scale-95"
        >
          {submitting ? 'Saving...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
};
