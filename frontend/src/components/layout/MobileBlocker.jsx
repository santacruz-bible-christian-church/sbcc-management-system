import { useState, useEffect } from 'react';
import { HiDesktopComputer } from 'react-icons/hi';

const MOBILE_BREAKPOINT = 1024; // Blocks phones and small tablets

/**
 * MobileBlocker - Displays a professional block screen on mobile devices
 * This system is designed for desktop/laptop use only
 */
export const MobileBlocker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      setIsChecking(false);
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Don't render anything during initial check to prevent flash
  if (isChecking) {
    return null;
  }

  // Show block screen on mobile devices
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6 z-[9999]">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <HiDesktopComputer className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Desktop Access Required
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            This system works best on a larger screen.
            Please switch to a laptop or desktop computer to continue.
          </p>

          {/* Divider */}
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-6" />

          {/* Helpful Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <p className="text-sm text-gray-400 mb-3">
              Here are a few options:
            </p>
            <ul className="text-sm text-gray-300 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Use a laptop or desktop computer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Try a tablet in landscape mode with a keyboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Reach out to your church admin for help</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 mt-8">
            Santa Cruz Bible Christian Church
          </p>
        </div>
      </div>
    );
  }

  // Render children (the app) on desktop
  return children;
};

export default MobileBlocker;
