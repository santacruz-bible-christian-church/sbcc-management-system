import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import ChurchImage from '../../../assets/ChurchImage.jpeg';
import SBCCLogo from '../../../assets/SBCCLogoHD.svg';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Church Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Church Image */}
        <img
          src={ChurchImage}
          alt="Church"
          className="w-full h-full object-cover scale-110"
        />
        {/* Translucent Yellow Overlay with Radial Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(253, 181, 74, 0.4) 0%, rgba(253, 181, 74, 0.7) 100%)'
          }}
        ></div>
        
        {/* SBCC Logo with Drop Shadow */}
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

      {/* Right Side - Login Form */}
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