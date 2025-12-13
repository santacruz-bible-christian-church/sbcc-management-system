import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>

          <p className="text-gray-600 mb-6">
            Sorry, you don't have permission to access this page.
            {user && (
              <span className="block mt-2 text-sm text-gray-500">
                Your current role: <span className="font-medium capitalize">{user.role?.replace('_', ' ')}</span>
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={18} />
                  Go Back
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a343] transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
