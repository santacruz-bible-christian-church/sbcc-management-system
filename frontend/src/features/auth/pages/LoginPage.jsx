import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import churchSvg from '../../../assets/church.svg';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Church Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#FDB54A] relative overflow-hidden items-center justify-center p-8">
        <img
          src={churchSvg}
          alt="Church Illustration"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F5F5F5]">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#FDB54A] rounded-full"></div>
              <h1 className="text-4xl font-bold text-[#FDB54A]">
                SBCC Management System
              </h1>
            </div>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-md p-10">
            <LoginForm onSuccess={handleLoginSuccess} />

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-[#FDB54A] hover:text-[#e5a43b] transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
