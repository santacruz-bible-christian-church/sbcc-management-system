import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import { authApi } from '../../../api/auth.api';
import { usePublicSettings } from '../../settings/hooks/usePublicSettings';
import ChurchImage from '../../../assets/ChurchImage.jpeg';
import SBCCLogoDefault from '../../../assets/SBCCLogoHD.svg';

export const ForgotPasswordPage = () => {
  const { settings, loading: settingsLoading } = usePublicSettings();
  const logoUrl = settings?.logo || SBCCLogoDefault;
  const appName = settings?.app_name || 'SBCC Management System';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(trimmedEmail);
      setSuccess(true);
    } catch (err) {
      // API always returns success for security, but handle network errors
      if (err.response?.data?.message) {
        setSuccess(true); // Still show success for security
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Church Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img
          src={ChurchImage}
          alt="Church"
          className="w-full h-full object-cover scale-110"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(253, 181, 74, 0.4) 0%, rgba(253, 181, 74, 0.7) 100%)'
          }}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-80 h-80 object-contain"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 20px 60px rgba(255, 255, 255, 0.6))'
            }}
          />
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F5F5]">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {!settingsLoading && (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              )}
              <h1 className="text-4xl font-bold text-[#FDB54A]">
                {appName}
              </h1>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-md p-10">
            {success ? (
              // Success State
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  If an account with that email exists, we&apos;ve sent you a link to reset your password.
                  Please check your inbox and spam folder.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#FDB54A] hover:text-[#e5a43b] font-medium transition-colors"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiOutlineMail className="w-8 h-8 text-[#FDB54A]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                  <p className="text-gray-600">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      disabled={loading}
                      className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors disabled:bg-gray-100 ${
                        error
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-gray-300 focus:border-[#FDB54A] focus:ring-1 focus:ring-[#FDB54A]'
                      }`}
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FDB54A] text-white py-3 px-4 rounded-lg hover:bg-[#e5a43b] transition-colors font-medium text-base shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-[#FDB54A] hover:text-[#e5a43b] transition-colors"
                  >
                    <HiArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
