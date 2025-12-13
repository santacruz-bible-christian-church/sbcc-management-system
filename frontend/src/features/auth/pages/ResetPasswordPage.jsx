import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff, HiArrowLeft, HiCheckCircle, HiExclamationCircle, HiLockClosed } from 'react-icons/hi';
import { authApi } from '../../../api/auth.api';
import ChurchImage from '../../../assets/ChurchImage.jpeg';
import SBCCLogo from '../../../assets/SBCCLogoHD.svg';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        await authApi.verifyResetToken(token);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validate = () => {
    const errors = {};

    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validate()) return;

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.new_password?.[0]
        || err.response?.data?.token?.[0]
        || err.response?.data?.detail
        || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#FDB54A] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
            src={SBCCLogo}
            alt="SBCC Logo"
            className="w-80 h-80 object-contain"
            style={{
              filter: 'drop-shadow(0 10px 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 20px 60px rgba(255, 255, 255, 0.6))'
            }}
          />
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F5F5]">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={SBCCLogo}
                alt="SBCC Logo"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-4xl font-bold text-[#FDB54A]">
                SBCC Management System
              </h1>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-md p-10">
            {!tokenValid ? (
              // Invalid/Expired Token State
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiExclamationCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired.
                  Please request a new one.
                </p>
                <Link
                  to="/forgot-password"
                  className="inline-block w-full bg-[#FDB54A] text-white py-3 px-4 rounded-lg hover:bg-[#e5a43b] transition-colors font-medium text-base shadow-sm text-center"
                >
                  Request New Link
                </Link>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm text-[#FDB54A] hover:text-[#e5a43b] transition-colors"
                  >
                    <HiArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : success ? (
              // Success State
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been reset successfully.
                  You&apos;ll be redirected to the login page shortly.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[#FDB54A] hover:text-[#e5a43b] font-medium transition-colors"
                >
                  <HiArrowLeft className="w-4 h-4" />
                  Go to Login Now
                </Link>
              </div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HiLockClosed className="w-8 h-8 text-[#FDB54A]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
                  <p className="text-gray-600">
                    Enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* New Password Field */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (validationErrors.newPassword) {
                            setValidationErrors(prev => ({ ...prev, newPassword: '' }));
                          }
                          if (error) setError('');
                        }}
                        disabled={loading}
                        className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition-colors disabled:bg-gray-100 ${
                          validationErrors.newPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-gray-300 focus:border-[#FDB54A] focus:ring-1 focus:ring-[#FDB54A]'
                        }`}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (validationErrors.confirmPassword) {
                            setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }
                          if (error) setError('');
                        }}
                        disabled={loading}
                        className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition-colors disabled:bg-gray-100 ${
                          validationErrors.confirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-gray-300 focus:border-[#FDB54A] focus:ring-1 focus:ring-[#FDB54A]'
                        }`}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
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
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
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
