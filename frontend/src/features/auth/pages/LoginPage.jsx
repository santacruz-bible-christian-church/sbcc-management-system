import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { HiUser, HiCalendar, HiChartBar, HiUserGroup } from 'react-icons/hi';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const features = [
    { 
      icon: HiUserGroup, 
      title: 'Member Management',
      description: 'Organize and track member information'
    },
    { 
      icon: HiCalendar, 
      title: 'Event Planning',
      description: 'Schedule and manage church events'
    },
    { 
      icon: HiChartBar, 
      title: 'Analytics',
      description: 'Real-time insights and reporting'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            {/* Logo & Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F6C67E] to-[#FDB54A] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-slate-800 font-semibold">SBCC Management</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Church Management
                <br />
                <span className="bg-gradient-to-r from-[#F6C67E] to-[#FDB54A] bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-md">
                Streamline your church operations with our comprehensive management platform designed for modern ministry.
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F6C67E] to-[#FDB54A] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-slate-800 font-semibold">SBCC Management</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-600">Sign in to continue to your dashboard</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
              <p className="text-slate-600">Enter your credentials to access your account</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
              <LoginForm onSuccess={handleLoginSuccess} />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Need help?</span>
                </div>
              </div>

              {/* Help Link */}
              <div className="text-center">
                <a 
                  href="#" 
                  className="text-sm text-slate-600 hover:text-orange-600 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Contact your administrator
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-6">
              © 2024 Santa Cruz Bible Christian Church
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};