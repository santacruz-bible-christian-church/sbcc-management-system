import { useEffect, useState } from 'react';
import { useUsers } from '../../user-management/hooks/useUsers';
import { useMinistries } from '../../ministries/hooks/useMinistries';

/**
 * TaskForm - Compact redesign with sticky action buttons
 */
export const TaskForm = ({ initialValues, onSubmit, onCancel, submitting }) => {
  const { users } = useUsers();
  const { ministries } = useMinistries();

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
      const cleanedData = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        ministry: formData.ministry || null,
      };
      onSubmit(cleanedData);
    }
  };

  const inputClasses = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-gray-900 text-sm";
  const selectClasses = `${inputClasses} appearance-none cursor-pointer`;
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 space-y-5 overflow-y-auto -mx-6 px-6 pb-4">
        {/* Title */}
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
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className={inputClasses}
            placeholder="Brief task description..."
          />
        </div>

        {/* Priority & Status - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className={labelClasses}>Status</label>
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
          </div>
        </div>

        {/* Dates - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={`${inputClasses} cursor-pointer`}
            />
            {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
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
              className={`${inputClasses} cursor-pointer`}
            />
            {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
          </div>
        </div>

        {/* Assignment - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Assigned To</label>
            <select
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="">Unassigned</option>
              {users.filter(u => u.is_active).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Ministry</label>
            <select
              name="ministry"
              value={formData.ministry || ''}
              onChange={handleChange}
              className={selectClasses}
            >
              <option value="">No Ministry</option>
              {ministries.map((ministry) => (
                <option key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClasses}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className={inputClasses}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4 -mx-6 px-6 bg-white">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 transition-all"
        >
          {submitting ? 'Saving...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
