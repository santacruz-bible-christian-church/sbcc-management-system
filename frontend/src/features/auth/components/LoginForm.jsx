import { useState } from 'react';
import { HiEye, HiEyeOff, HiExclamationCircle } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = ({ onSuccess }) => {
  const { login, error: authError, loading: authLoading, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername) {
      errors.username = 'Username is required';
    } else if (trimmedUsername.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!trimmedPassword) {
      errors.password = 'Password is required';
    } else if (trimmedPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearError();
    setValidationErrors({});

    // Validate inputs
    if (!validate()) return;

    // Attempt login with trimmed values
    const result = await login(username.trim(), password.trim());

    if (result.success) {
      onSuccess();
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (validationErrors.username) {
      setValidationErrors(prev => ({ ...prev, username: '' }));
    }
    if (authError) clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: '' }));
    }
    if (authError) clearError();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Server Error */}
      {authError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Login Failed</p>
            <p className="text-red-600 mt-0.5">{authError}</p>
          </div>
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          disabled={authLoading}
          className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors disabled:bg-gray-100 ${
            validationErrors.username
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-[#FDB54A] focus:ring-1 focus:ring-[#FDB54A]'
          }`}
          placeholder="Enter your username"
          autoComplete="username"
        />
        {validationErrors.username && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            disabled={authLoading}
            className={`w-full px-4 py-3 pr-12 rounded-lg border outline-none transition-colors disabled:bg-gray-100 ${
              validationErrors.password
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:border-[#FDB54A] focus:ring-1 focus:ring-[#FDB54A]'
            }`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={authLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <HiEyeOff className="w-5 h-5" />
            ) : (
              <HiEye className="w-5 h-5" />
            )}
          </button>
        </div>
        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={authLoading}
        className="w-full bg-[#FDB54A] text-white py-3 px-4 rounded-lg hover:bg-[#e5a43b] transition-colors font-medium text-base shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {authLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
        ) : (
          'Log In'
        )}
      </button>
    </form>
  );
};
