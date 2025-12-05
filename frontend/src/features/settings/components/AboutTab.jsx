import { useState, useEffect } from 'react';
import { HiOutlineSave } from 'react-icons/hi';
import { PrimaryButton } from '../../../components/ui/Button';

export const AboutTab = ({ settings, onSave, saving }) => {
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    history: '',
    statement_of_faith: '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        mission: settings.mission || '',
        vision: settings.vision || '',
        history: settings.history || '',
        statement_of_faith: settings.statement_of_faith || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData, false);
    setHasChanges(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mission */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
          Mission Statement
        </label>
        <textarea
          id="mission"
          name="mission"
          value={formData.mission}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
          placeholder="Enter your church's mission statement..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-2">
          Your church's purpose and calling
        </p>
      </div>

      {/* Vision */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
          Vision Statement
        </label>
        <textarea
          id="vision"
          name="vision"
          value={formData.vision}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
          placeholder="Enter your church's vision statement..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-2">
          Where your church is headed in the future
        </p>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="history" className="block text-sm font-medium text-gray-700 mb-2">
          Church History
        </label>
        <textarea
          id="history"
          name="history"
          value={formData.history}
          onChange={handleInputChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
          placeholder="Share your church's history and journey..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-2">
          Brief history of how your church was founded and grew
        </p>
      </div>

      {/* Statement of Faith */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label htmlFor="statement_of_faith" className="block text-sm font-medium text-gray-700 mb-2">
          Statement of Faith
        </label>
        <textarea
          id="statement_of_faith"
          name="statement_of_faith"
          value={formData.statement_of_faith}
          onChange={handleInputChange}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sbcc-primary focus:border-transparent"
          placeholder="Enter your church's beliefs and doctrinal statements..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-2">
          Core beliefs and doctrinal statements of your church
        </p>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div>
          {hasChanges && (
            <p className="text-sm text-amber-600">You have unsaved changes</p>
          )}
        </div>
        <PrimaryButton
          type="submit"
          icon={HiOutlineSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </form>
  );
};
