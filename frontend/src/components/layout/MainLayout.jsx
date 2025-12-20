import { useState } from 'react';
import SCBCSidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * MainLayout - Shared layout for all authenticated pages
 * Provides consistent sidebar navigation, top navbar, and content structure
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

      {/* Main Content Area with Navbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-sbcc-cream via-white to-sbcc-light-orange">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
