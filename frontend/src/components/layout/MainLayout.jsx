import { useState } from 'react';
import SCBCSidebar from './Sidebar';

/**
 * MainLayout - Shared layout for all authenticated pages
 * Provides consistent sidebar navigation and content structure with toggle functionality
 */
export const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <SCBCSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-sbcc-cream via-white to-sbcc-light-orange">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
