import { useNavigate } from 'react-router-dom';
import { Card } from 'flowbite-react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            SBCC Management System
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        <div className="text-center mt-4 text-sm text-gray-600">
          <p>Default admin credentials</p>
        </div>
      </Card>
    </div>
  );
};