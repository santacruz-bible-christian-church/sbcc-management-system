import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { usePublicSettings } from '../../settings/hooks/usePublicSettings';
import ChurchImage from '../../../assets/ChurchImage.jpeg';
import SBCCLogoDefault from '../../../assets/SBCCLogoHD.svg';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = usePublicSettings();

  // Use logo from settings if available, otherwise use default
  const logoUrl = settings?.logo || SBCCLogoDefault;
  const appName = settings?.app_name || 'SBCC Management System';

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
            src={logoUrl}
            alt="Logo"
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
          <div className="mb-8 text-center">
            {!settingsLoading && (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {appName}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-md p-10">
            <LoginForm onSuccess={handleLoginSuccess} />

            {/* Forgot Password Link */}
            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-[#FDB54A] hover:text-[#e5a43b] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
