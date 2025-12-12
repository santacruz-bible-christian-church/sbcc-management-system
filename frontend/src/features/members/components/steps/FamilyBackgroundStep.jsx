import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiPlus, HiTrash } from 'react-icons/hi';

const FamilyBackgroundStep = ({ formData, updateFormData, loading }) => {
  const [newMember, setNewMember] = useState({ name: '', relationship: '', birthdate: '' });

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.relationship.trim()) {
      return;
    }

    const updatedMembers = [...(formData.family_members || []), { ...newMember }];
    updateFormData({ family_members: updatedMembers });
    setNewMember({ name: '', relationship: '', birthdate: '' });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = formData.family_members.filter((_, i) => i !== index);
    updateFormData({ family_members: updatedMembers });
  };

  const handleNewMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Add family members who are also part of your household.
        </p>
      </div>

      {/* Add New Family Member */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Add Family Member</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={newMember.name}
              onChange={handleNewMemberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
              disabled={loading}
              placeholder="Full Name"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <input
              type="text"
              name="relationship"
              value={newMember.relationship}
              onChange={handleNewMemberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
              disabled={loading}
              placeholder="e.g., Spouse, Child"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthdate
            </label>
            <input
              type="date"
              name="birthdate"
              value={newMember.birthdate}
              onChange={handleNewMemberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddMember}
              disabled={loading || !newMember.name.trim() || !newMember.relationship.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Family Members List */}
      {formData.family_members && formData.family_members.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Family Members ({formData.family_members.length})</h4>
          <div className="space-y-2">
            {formData.family_members.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#FDB54A] transition-colors"
              >
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">Name</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.relationship}</p>
                    <p className="text-xs text-gray-500">Relationship</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.birthdate || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Birthdate</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  disabled={loading}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.family_members && formData.family_members.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No family members added yet</p>
        </div>
      )}
    </div>
  );
};

FamilyBackgroundStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default FamilyBackgroundStep;