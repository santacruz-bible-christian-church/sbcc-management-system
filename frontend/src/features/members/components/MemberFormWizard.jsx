import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { HiX, HiArrowLeft, HiArrowRight, HiCheck } from 'react-icons/hi';
import { showWarning } from '../../../utils/toast';
import PersonalInfoStep from './steps/PersonalInfoStep';
import EducationalBackgroundStep from './steps/EducationalBackgroundStep';
import FamilyBackgroundStep from './steps/FamilyBackgroundStep';
import SpiritualInfoStep from './steps/SpiritualInfoStep';
import ChurchBackgroundStep from './steps/ChurchBackgroundStep';

const STEPS = [
  { id: 'personal', title: 'Personal Information', component: PersonalInfoStep },
  { id: 'education', title: 'Educational Background', component: EducationalBackgroundStep },
  { id: 'family', title: 'Family Background', component: FamilyBackgroundStep },
  { id: 'spiritual', title: 'Spiritual Information', component: SpiritualInfoStep },
  { id: 'church', title: 'Church Background', component: ChurchBackgroundStep },
];

export const MemberFormWizard = ({ open, onClose, onSubmit, member = null, loading, ministries }) => {
  const isEdit = !!member;
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  const [formData, setFormData] = useState({
    // Personal Info (existing fields)
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    complete_address: '',
    occupation: '',
    marital_status: '',
    wedding_anniversary: '',
    
    // Educational Background
    elementary_school: '',
    elementary_year_graduated: '',
    secondary_school: '',
    secondary_year_graduated: '',
    vocational_school: '',
    vocational_year_graduated: '',
    college: '',
    college_year_graduated: '',
    
    // Family Members
    family_members: [],
    
    // Spiritual Information
    accepted_jesus: false,
    salvation_testimony: '',
    spiritual_birthday: '',
    baptism_date: '',
    willing_to_be_baptized: false,
    
    // Church Background
    ministry: '',
    previous_church: '',
    how_introduced: '',
    began_attending_since: '',
    is_active: true,
  });
  
  const [errors, setErrors] = useState({});

  // Initialize form data when member changes or modal opens
  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        date_of_birth: member.date_of_birth || '',
        gender: member.gender || '',
        complete_address: member.complete_address || '',
        occupation: member.occupation || '',
        marital_status: member.marital_status || '',
        wedding_anniversary: member.wedding_anniversary || '',
        elementary_school: member.elementary_school || '',
        elementary_year_graduated: member.elementary_year_graduated || '',
        secondary_school: member.secondary_school || '',
        secondary_year_graduated: member.secondary_year_graduated || '',
        vocational_school: member.vocational_school || '',
        vocational_year_graduated: member.vocational_year_graduated || '',
        college: member.college || '',
        college_year_graduated: member.college_year_graduated || '',
        family_members: member.family_members || [],
        accepted_jesus: member.accepted_jesus || false,
        salvation_testimony: member.salvation_testimony || '',
        spiritual_birthday: member.spiritual_birthday || '',
        baptism_date: member.baptism_date || '',
        willing_to_be_baptized: member.willing_to_be_baptized || false,
        ministry: member.ministry ? String(member.ministry) : '',
        previous_church: member.previous_church || '',
        how_introduced: member.how_introduced || '',
        began_attending_since: member.began_attending_since || '',
        is_active: member.is_active !== undefined ? member.is_active : true,
      });
    } else {
      // Reset to defaults for new member
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        complete_address: '',
        occupation: '',
        marital_status: '',
        wedding_anniversary: '',
        elementary_school: '',
        elementary_year_graduated: '',
        secondary_school: '',
        secondary_year_graduated: '',
        vocational_school: '',
        vocational_year_graduated: '',
        college: '',
        college_year_graduated: '',
        family_members: [],
        accepted_jesus: false,
        salvation_testimony: '',
        spiritual_birthday: '',
        baptism_date: '',
        willing_to_be_baptized: false,
        ministry: '',
        previous_church: '',
        how_introduced: '',
        began_attending_since: '',
        is_active: true,
      });
    }
    setErrors({});
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, [member, open]);

  const updateFormData = useCallback((stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  }, []);

  const validateStep = useCallback((stepIndex) => {
    const newErrors = {};
    
    // Step 0: Personal Information
    if (stepIndex === 0) {
      if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required';
      }
    }
    
    // Other steps are optional, so no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      showWarning('Please fill in all required fields');
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepIndex) => {
    // Allow jumping to completed steps or the next immediate step
    if (completedSteps.has(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [completedSteps, currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(currentStep)) {
      showWarning('Please complete the current step');
      return;
    }

    // Clean data before submission
    const cleanData = { ...formData };
    
    // Convert empty strings to null
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === '') {
        cleanData[key] = null;
      }
    });

    await onSubmit(cleanData);
  }, [currentStep, formData, onSubmit, validateStep]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={handleCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold text-gray-900">
                {isEdit ? 'Edit Member' : 'Add New Member'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="relative">
              {/* Background bar */}
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FDB54A] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Step indicators */}
              <div className="flex justify-between mt-3">
                {STEPS.map((step, index) => {
                  const isCompleted = completedSteps.has(index);
                  const isCurrent = index === currentStep;
                  const isAccessible = isCompleted || isCurrent;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      disabled={!isAccessible || loading}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-[#FDB54A] text-white ring-4 ring-[#FDB54A]/30'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <HiCheck className="w-5 h-5" /> : index + 1}
                      </div>
                      <span className={`text-xs font-medium ${isCurrent ? 'text-[#FDB54A]' : 'text-gray-500'}`}>
                        {step.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              setErrors={setErrors}
              ministries={ministries}
              loading={loading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0 || loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              {currentStep + 1} of {STEPS.length}
            </div>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <HiArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    {isEdit ? 'Update Member' : 'Create Member'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

MemberFormWizard.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  member: PropTypes.object,
  loading: PropTypes.bool,
  ministries: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MemberFormWizard;