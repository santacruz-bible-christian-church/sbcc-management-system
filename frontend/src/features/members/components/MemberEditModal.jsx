import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { HiX, HiCheck, HiPlus, HiTrash } from "react-icons/hi";

// Reusable input component
const FormInput = ({ label, name, value, onChange, type = "text", error, required, placeholder, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all ${
        error ? "border-red-500" : "border-gray-200"
      } ${disabled ? "bg-gray-100" : ""}`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Reusable select component
const FormSelect = ({ label, name, value, onChange, options, error, required, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 focus:border-[#FDB54A] transition-all ${
        error ? "border-red-500" : "border-gray-200"
      } ${disabled ? "bg-gray-100" : ""}`}
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Section header component
const SectionHeader = ({ title }) => (
  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
    {title}
  </h3>
);

export const MemberEditModal = ({
  open,
  onClose,
  onSubmit,
  member,
  loading,
  ministries,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form data when member changes or modal opens
  useEffect(() => {
    if (open && member) {
      setFormData({
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        phone: member.phone || "",
        date_of_birth: member.date_of_birth || "",
        gender: member.gender || "",
        complete_address: member.complete_address || "",
        occupation: member.occupation || "",
        marital_status: member.marital_status || "",
        wedding_anniversary: member.wedding_anniversary || "",
        elementary_school: member.elementary_school || "",
        elementary_year_graduated: member.elementary_year_graduated || "",
        secondary_school: member.secondary_school || "",
        secondary_year_graduated: member.secondary_year_graduated || "",
        vocational_school: member.vocational_school || "",
        vocational_year_graduated: member.vocational_year_graduated || "",
        college: member.college || "",
        college_year_graduated: member.college_year_graduated || "",
        family_members: member.family_members || [],
        accepted_jesus: member.accepted_jesus ?? null,
        salvation_testimony: member.salvation_testimony || "",
        spiritual_birthday: member.spiritual_birthday || "",
        baptism_date: member.baptism_date || "",
        willing_to_be_baptized: member.willing_to_be_baptized ?? null,
        ministry: member.ministry?.id || member.ministry || "",
        previous_church: member.previous_church || "",
        how_introduced: member.how_introduced || "",
        began_attending_since: member.began_attending_since || "",
        is_active: member.is_active !== undefined ? member.is_active : true,
      });
      setErrors({});
    }
  }, [member, open]);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Family member handlers
  const addFamilyMember = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      family_members: [...(prev.family_members || []), { name: "", relationship: "", birthdate: "" }],
    }));
  }, []);

  const removeFamilyMember = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      family_members: prev.family_members.filter((_, i) => i !== index),
    }));
  }, []);

  const updateFamilyMember = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      family_members: prev.family_members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Sanitize data before submit
    const sanitizedData = { ...formData };

    // Convert empty strings to null for optional fields
    const optionalFields = [
      'gender', 'complete_address', 'occupation', 'marital_status',
      'elementary_school', 'secondary_school', 'vocational_school', 'college',
      'salvation_testimony', 'previous_church', 'how_introduced', 'ministry',
      'wedding_anniversary', 'spiritual_birthday', 'baptism_date', 'began_attending_since'
    ];
    optionalFields.forEach(field => {
      if (sanitizedData[field] === '') sanitizedData[field] = null;
    });

    // Convert year fields to integers
    const yearFields = ['elementary_year_graduated', 'secondary_year_graduated', 'vocational_year_graduated', 'college_year_graduated'];
    yearFields.forEach(field => {
      if (sanitizedData[field] === '' || sanitizedData[field] === null) {
        sanitizedData[field] = null;
      } else {
        const parsed = parseInt(sanitizedData[field], 10);
        sanitizedData[field] = isNaN(parsed) ? null : parsed;
      }
    });

    // Clean family members
    if (sanitizedData.family_members) {
      sanitizedData.family_members = sanitizedData.family_members
        .filter(m => m.name && m.relationship)
        .map(m => ({
          name: m.name.trim(),
          relationship: m.relationship.trim(),
          birthdate: m.birthdate || null,
        }));
    }

    try {
      await onSubmit(sanitizedData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!open || !member) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Edit Member
              </h2>
              <p className="text-sm text-gray-500">
                {member.first_name} {member.last_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <section>
                <SectionHeader title="Personal Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormInput label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} required />
                  <FormInput label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} required />
                  <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                  <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />
                  <FormInput label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} required />
                  <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]} />
                  <FormSelect label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={[
                    { value: "single", label: "Single" },
                    { value: "married", label: "Married" },
                    { value: "widowed", label: "Widowed" },
                    { value: "divorced", label: "Divorced" },
                  ]} />
                  {formData.marital_status === "married" && (
                    <FormInput label="Wedding Anniversary" name="wedding_anniversary" type="date" value={formData.wedding_anniversary} onChange={handleChange} />
                  )}
                  <FormInput label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                  <div className="lg:col-span-2">
                    <FormInput label="Complete Address" name="complete_address" value={formData.complete_address} onChange={handleChange} />
                  </div>
                </div>
              </section>

              {/* Educational Background */}
              <section>
                <SectionHeader title="Educational Background" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Elementary School" name="elementary_school" value={formData.elementary_school} onChange={handleChange} />
                  <FormInput label="Year Graduated" name="elementary_year_graduated" type="number" value={formData.elementary_year_graduated} onChange={handleChange} placeholder="e.g., 2005" />
                  <FormInput label="Secondary/High School" name="secondary_school" value={formData.secondary_school} onChange={handleChange} />
                  <FormInput label="Year Graduated" name="secondary_year_graduated" type="number" value={formData.secondary_year_graduated} onChange={handleChange} placeholder="e.g., 2009" />
                  <FormInput label="Vocational School" name="vocational_school" value={formData.vocational_school} onChange={handleChange} />
                  <FormInput label="Year Graduated" name="vocational_year_graduated" type="number" value={formData.vocational_year_graduated} onChange={handleChange} />
                  <FormInput label="College/University" name="college" value={formData.college} onChange={handleChange} />
                  <FormInput label="Year Graduated" name="college_year_graduated" type="number" value={formData.college_year_graduated} onChange={handleChange} />
                </div>
              </section>

              {/* Family Background */}
              <section>
                <SectionHeader title="Family Background" />
                <div className="space-y-3">
                  {(formData.family_members || []).map((member, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={member.name || ""}
                          onChange={(e) => updateFamilyMember(index, "name", e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50"
                        />
                        <select
                          value={member.relationship || ""}
                          onChange={(e) => updateFamilyMember(index, "relationship", e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50"
                        >
                          <option value="">Relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="date"
                          value={member.birthdate || ""}
                          onChange={(e) => updateFamilyMember(index, "birthdate", e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FDB54A] border border-[#FDB54A] rounded-lg hover:bg-[#FDB54A] hover:text-white transition-colors"
                  >
                    <HiPlus className="w-4 h-4" />
                    Add Family Member
                  </button>
                </div>
              </section>

              {/* Spiritual Information */}
              <section>
                <SectionHeader title="Spiritual Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect label="Have you accepted Jesus?" name="accepted_jesus" value={formData.accepted_jesus === null ? "" : formData.accepted_jesus ? "true" : "false"} onChange={(e) => {
                    const val = e.target.value === "" ? null : e.target.value === "true";
                    setFormData(prev => ({ ...prev, accepted_jesus: val }));
                  }} options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]} />
                  <FormInput label="Spiritual Birthday" name="spiritual_birthday" type="date" value={formData.spiritual_birthday} onChange={handleChange} />
                  <FormInput label="Baptism Date" name="baptism_date" type="date" value={formData.baptism_date} onChange={handleChange} />
                  <FormSelect label="Willing to be Baptized?" name="willing_to_be_baptized" value={formData.willing_to_be_baptized === null ? "" : formData.willing_to_be_baptized ? "true" : "false"} onChange={(e) => {
                    const val = e.target.value === "" ? null : e.target.value === "true";
                    setFormData(prev => ({ ...prev, willing_to_be_baptized: val }));
                  }} options={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salvation Testimony</label>
                    <textarea
                      name="salvation_testimony"
                      value={formData.salvation_testimony || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FDB54A]/50 resize-none"
                      placeholder="Share your testimony..."
                    />
                  </div>
                </div>
              </section>

              {/* Church Background */}
              <section>
                <SectionHeader title="Church Background" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect label="Ministry" name="ministry" value={formData.ministry} onChange={handleChange} options={(ministries || []).map(m => ({ value: m.id.toString(), label: m.name }))} />
                  <FormInput label="Previous Church" name="previous_church" value={formData.previous_church} onChange={handleChange} />
                  <FormSelect label="How were you introduced?" name="how_introduced" value={formData.how_introduced} onChange={handleChange} options={[
                    { value: "friend", label: "Friend/Family" },
                    { value: "social_media", label: "Social Media" },
                    { value: "walk_in", label: "Walk-in" },
                    { value: "event", label: "Church Event" },
                    { value: "other", label: "Other" },
                  ]} />
                  <FormInput label="Began Attending Since" name="began_attending_since" type="date" value={formData.began_attending_since} onChange={handleChange} />
                </div>
              </section>
            </form>
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <HiCheck className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

MemberEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  member: PropTypes.object,
  loading: PropTypes.bool,
  ministries: PropTypes.arrayOf(PropTypes.object),
};

export default MemberEditModal;
