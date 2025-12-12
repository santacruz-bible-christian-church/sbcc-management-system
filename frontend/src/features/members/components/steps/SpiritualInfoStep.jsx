import PropTypes from 'prop-types';

const SpiritualInfoStep = ({ formData, updateFormData, loading }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          This information helps us provide better spiritual care and support.
        </p>
      </div>

      {/* Salvation */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            name="accepted_jesus"
            checked={formData.accepted_jesus}
            onChange={handleChange}
            className="mt-1 w-5 h-5 text-[#FDB54A] border-gray-300 rounded focus:ring-[#FDB54A]"
            disabled={loading}
          />
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Have you accepted Jesus Christ as your personal Lord and Savior?
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Check this box if yes
            </p>
          </div>
        </div>

        {formData.accepted_jesus && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did you come to know Jesus Christ as your Savior?
            </label>
            <textarea
              name="salvation_testimony"
              value={formData.salvation_testimony}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent resize-none"
              disabled={loading}
              placeholder="Share your testimony briefly..."
            />
          </div>
        )}
      </div>

      {/* Spiritual Birthday */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Spiritual Birthday
        </label>
        <input
          type="date"
          name="spiritual_birthday"
          value={formData.spiritual_birthday}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          The date you accepted Christ
        </p>
      </div>

      {/* Baptism */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Baptism Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baptismal Date
          </label>
          <input
            type="date"
            name="baptism_date"
            value={formData.baptism_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank if not yet baptized
          </p>
        </div>

        {!formData.baptism_date && (
          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              name="willing_to_be_baptized"
              checked={formData.willing_to_be_baptized}
              onChange={handleChange}
              className="mt-1 w-5 h-5 text-[#FDB54A] border-gray-300 rounded focus:ring-[#FDB54A]"
              disabled={loading}
            />
            <label className="block text-sm font-medium text-gray-900">
              If not, are you willing to be baptized?
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

SpiritualInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default SpiritualInfoStep;