import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { HiX, HiChevronLeft, HiChevronRight, HiCheck, HiDownload } from "react-icons/hi";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import EducationalBackgroundStep from "./steps/EducationalBackgroundStep";
import FamilyBackgroundStep from "./steps/FamilyBackgroundStep";
import SpiritualInfoStep from "./steps/SpiritualInfoStep";
import ChurchBackgroundStep from "./steps/ChurchBackgroundStep";
import { generateMembershipFormPDF } from "../utils/memberFormPDF";

const STEPS = [
  {
    id: "personal",
    title: "Personal Information",
    component: PersonalInfoStep,
  },
  {
    id: "education",
    title: "Educational Background",
    component: EducationalBackgroundStep,
  },
  {
    id: "family",
    title: "Family Background",
    component: FamilyBackgroundStep,
  },
  {
    id: "spiritual",
    title: "Spiritual Information",
    component: SpiritualInfoStep,
  },
  {
    id: "church",
    title: "Church Background",
    component: ChurchBackgroundStep,
  },
];

export const MemberFormModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  ministries,
}) => {
  // This modal is now only used for creating new members
  // Edit functionality is handled by MemberEditModal
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    complete_address: "",
    occupation: "",
    marital_status: "",
    wedding_anniversary: "",
    elementary_school: "",
    elementary_year_graduated: "",
    secondary_school: "",
    secondary_year_graduated: "",
    vocational_school: "",
    vocational_year_graduated: "",
    college: "",
    college_year_graduated: "",
    family_members: [],
    accepted_jesus: null,
    salvation_testimony: "",
    spiritual_birthday: "",
    baptism_date: "",
    willing_to_be_baptized: null,
    ministry: "",
    previous_church: "",
    how_introduced: "",
    began_attending_since: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        complete_address: "",
        occupation: "",
        marital_status: "",
        wedding_anniversary: "",
        elementary_school: "",
        elementary_year_graduated: "",
        secondary_school: "",
        secondary_year_graduated: "",
        vocational_school: "",
        vocational_year_graduated: "",
        college: "",
        college_year_graduated: "",
        family_members: [],
        accepted_jesus: null,
        salvation_testimony: "",
        spiritual_birthday: "",
        baptism_date: "",
        willing_to_be_baptized: null,
        ministry: "",
        previous_church: "",
        how_introduced: "",
        began_attending_since: "",
        is_active: true,
      });
      setErrors({});
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [open]);

  const updateFormData = useCallback((stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  const validateStep = useCallback(
    (stepIndex) => {
      const newErrors = {};

      if (stepIndex === 0) {
        // Personal Information validation
        if (!formData.first_name?.trim()) {
          newErrors.first_name = "First name is required";
        }
        if (!formData.last_name?.trim()) {
          newErrors.last_name = "Last name is required";
        }
        if (!formData.email?.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
        if (!formData.phone?.trim()) {
          newErrors.phone = "Phone is required";
        }
        if (!formData.date_of_birth) {
          newErrors.date_of_birth = "Date of birth is required";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  // Sanitize form data before submission
  const sanitizeFormData = useCallback((data) => {
    const sanitized = { ...data };

    // Convert empty strings to null for optional text fields
    const textFields = [
      'gender',
      'complete_address',
      'occupation',
      'marital_status',
      'elementary_school',
      'secondary_school',
      'vocational_school',
      'college',
      'salvation_testimony',
      'previous_church',
      'how_introduced',
      'ministry'
    ];

    textFields.forEach(field => {
      if (sanitized[field] === '') {
        sanitized[field] = null;
      }
    });

    // Convert empty strings to null for date fields
    const dateFields = [
      'wedding_anniversary',
      'spiritual_birthday',
      'baptism_date',
      'began_attending_since'
    ];

    dateFields.forEach(field => {
      if (!sanitized[field] || sanitized[field] === '') {
        sanitized[field] = null;
      }
    });

    // Convert empty strings to null for integer fields
    const integerFields = [
      'elementary_year_graduated',
      'secondary_year_graduated',
      'vocational_year_graduated',
      'college_year_graduated'
    ];

    integerFields.forEach(field => {
      if (sanitized[field] === '' || sanitized[field] === null) {
        sanitized[field] = null;
      } else if (typeof sanitized[field] === 'string') {
        const parsed = parseInt(sanitized[field], 10);
        sanitized[field] = isNaN(parsed) ? null : parsed;
      }
    });


    const booleanFields = ['accepted_jesus', 'willing_to_be_baptized'];

    booleanFields.forEach(field => {
      if (sanitized[field] === null || sanitized[field] === undefined || sanitized[field] === '') {

        sanitized[field] = null;
      } else {

        sanitized[field] = Boolean(sanitized[field]);
      }
    });

    // ✅ Sanitize and validate family members
    if (sanitized.family_members && Array.isArray(sanitized.family_members)) {
      sanitized.family_members = sanitized.family_members
        .map(member => {
          // Ensure member is an object
          if (typeof member !== 'object' || member === null) {
            console.warn('Invalid family member data:', member);
            return null;
          }

          // Clean and validate each field
          const cleanMember = {
            name: (member.name || '').toString().trim(),
            relationship: (member.relationship || '').toString().trim(),
            birthdate: member.birthdate || null,
          };

          // Validate birthdate format if provided
          if (cleanMember.birthdate && cleanMember.birthdate !== '') {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(cleanMember.birthdate)) {
              console.warn('Invalid birthdate format:', cleanMember.birthdate);
              cleanMember.birthdate = null;
            }
          } else {
            cleanMember.birthdate = null;
          }

          return cleanMember;
        })
        .filter(member => {
          // Remove invalid entries
          if (!member) return false;
          // Remove entries with no name
          if (!member.name) return false;
          // Remove entries with no relationship
          if (!member.relationship) return false;
          return true;
        });
    } else {
      sanitized.family_members = [];
    }

    // Validate required fields (final check before submission)
    const requiredFields = {
      first_name: 'First name',
      last_name: 'Last name',
      email: 'Email',
      phone: 'Phone number',
      date_of_birth: 'Date of birth',
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!sanitized[field] || sanitized[field].toString().trim() === '') {
        console.error(`Validation Error: ${label} is required`);
      }
    });

    // Validate email format
    if (sanitized.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(sanitized.email)) {
        console.error('Validation Error: Invalid email format');
      }
    }

    // Validate phone format (Philippine format)
    if (sanitized.phone) {
      const phonePattern = /^(\+63|0)?\d{3}-?\d{3}-?\d{4}$/;
      if (!phonePattern.test(sanitized.phone.replace(/\s/g, ''))) {
        console.warn('Phone number format may be invalid:', sanitized.phone);
      }
    }

    // Validate date of birth (not in the future)
    if (sanitized.date_of_birth) {
      const dob = new Date(sanitized.date_of_birth);
      const today = new Date();
      if (dob > today) {
        console.error('Validation Error: Date of birth cannot be in the future');
      }
    }

    // Validate marital status - wedding anniversary required if married
    if (sanitized.marital_status === 'married' && !sanitized.wedding_anniversary) {
      console.warn('Wedding anniversary recommended for married status');
    }

    // Log sanitized data for debugging
    console.log('Sanitized form data:', {
      ...sanitized,
      family_members_count: sanitized.family_members.length,
    });

    return sanitized;
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (stepIndex) => {
      // Only allow clicking on completed or current steps
      if (stepIndex < currentStep || completedSteps.has(stepIndex)) {
        setCurrentStep(stepIndex);
      }
    },
    [completedSteps, currentStep]
  );

  const handleCancel = useCallback(() => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      complete_address: "",
      occupation: "",
      marital_status: "",
      wedding_anniversary: "",
      elementary_school: "",
      elementary_year_graduated: "",
      secondary_school: "",
      secondary_year_graduated: "",
      vocational_school: "",
      vocational_year_graduated: "",
      college: "",
      college_year_graduated: "",
      family_members: [],
      accepted_jesus: null,
      salvation_testimony: "",
      spiritual_birthday: "",
      baptism_date: "",
      willing_to_be_baptized: null,
      ministry: "",
      previous_church: "",
      how_introduced: "",
      began_attending_since: "",
      is_active: true,
    });
    setErrors({});
    setCurrentStep(0);
    setCompletedSteps(new Set());
    onClose();
  }, [onClose]);

  // Handle "Next" button in create mode
  const handleNextStep = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Handle save/submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate current step (Personal Info always required)
    if (!validateStep(0)) {
      setCurrentStep(0); // Go to personal info step if validation fails
      return;
    }

    const sanitizedData = sanitizeFormData(formData);

    try {
      await onSubmit(sanitizedData);

      // Auto-generate PDF for new members
      generateMembershipFormPDF(formData);

      // Close modal on success
      handleCancel();
    } catch (error) {
      // Error is handled by parent
      console.error('Form submission error:', error);
    }
  };

  const handleExportPDF = useCallback(() => {
    generateMembershipFormPDF(formData);
  }, [formData]);

  if (!open) return null;

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Member
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Step {currentStep + 1} of {STEPS.length}:{" "}
                  {STEPS[currentStep].title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Export PDF Button */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Download Membership Form as PDF"
                >
                  <HiDownload className="w-5 h-5" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>

                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#FDB54A] h-2 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = completedSteps.has(index);
                const isClickable = index < currentStep || completedSteps.has(index);

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable || loading}
                    className={`flex-1 flex flex-col items-center gap-2 transition-all ${
                      isClickable && !loading
                        ? "cursor-pointer"
                        : "cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#FDB54A] text-white ring-4 ring-[#FDB54A] ring-opacity-20"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <HiCheck className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs text-center hidden md:block transition-colors ${
                        isActive ? "text-[#FDB54A] font-semibold" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body - Step Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              setErrors={setErrors}
              loading={loading}
              ministries={ministries}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <HiChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              {/* Show Next on non-last steps, Create Member on last step */}
              {isLastStep ? (
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <HiCheck className="w-5 h-5" />
                      Create Member
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="px-5 py-2 text-sm font-medium bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <HiChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

MemberFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  ministries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MemberFormModal;
