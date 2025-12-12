import PropTypes from 'prop-types';

const ChurchBackgroundStep = ({ formData, updateFormData, ministries, loading }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Help us understand your church journey and involvement.
        </p>
      </div>

      {/* Ministry Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ministry Assignment
        </label>
        <select
          name="ministry"
          value={formData.ministry}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent text-gray-900"
          disabled={loading}
        >
          <option value="" className="text-gray-400">Select Ministry (Optional)</option>
          {ministries?.map((ministry) => (
            <option key={ministry.id} value={ministry.id}>
              {ministry.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Which ministry would you like to serve in?
        </p>
      </div>

      {/* Previous Church */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Previous Church Membership
        </label>
        <input
          type="text"
          name="previous_church"
          value={formData.previous_church}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent placeholder:text-gray-400"
          disabled={loading}
          placeholder="e.g., First Baptist Church Manila"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave blank if this is your first church
        </p>
      </div>

      {/* How Introduced */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How were you introduced to our church?
        </label>
        <textarea
          name="how_introduced"
          value={formData.how_introduced}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent resize-none placeholder:text-gray-400"
          disabled={loading}
          placeholder="e.g., Invited by a friend, Found online, Passing by, etc."
        />
      </div>

      {/* Began Attending */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          When did you begin attending?
        </label>
        <input
          type="date"
          name="began_attending_since"
          value={formData.began_attending_since}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
          disabled={loading}
        />
      </div>

      {/* Active Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="mt-1 w-5 h-5 text-[#FDB54A] border-gray-300 rounded focus:ring-[#FDB54A]"
            disabled={loading}
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Active Member</p>
            <p className="text-xs text-gray-500 mt-1">
              Check if this person is currently an active member of the church
            </p>
          </div>
        </label>
      </div>

      {/* Summary Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-2">Ready to Submit</h4>
        <p className="text-sm text-green-800">
          Review all the information you've entered and click "Create Member" to complete the registration.
        </p>
      </div>
    </div>
  );
};

ChurchBackgroundStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  ministries: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
};

export default ChurchBackgroundStep;