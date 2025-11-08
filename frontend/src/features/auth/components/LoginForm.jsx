// filepath: c:\Users\63923\Desktop\sbcc-management-system\frontend\src\features\auth\components\LoginForm.jsx
import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const LoginForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login/`,
        { username, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running on port 8000.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-xs font-medium text-gray-600 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#F6A62B] focus:ring-1 focus:ring-[#F6A62B] outline-none transition-colors disabled:bg-gray-100"
          placeholder="Enter your username"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#F6A62B] focus:ring-1 focus:ring-[#F6A62B] outline-none transition-colors disabled:bg-gray-100"
          placeholder="••••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#F6A62B] text-white py-3 px-4 rounded-lg hover:bg-[#E8973D] transition-colors font-medium text-base shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};