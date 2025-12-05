import { useState } from 'react';
import { Spinner, Tabs } from 'flowbite-react';
import { HiOutlineCog, HiOutlineInformationCircle, HiOutlinePhone } from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { BrandingTab } from '../components/BrandingTab';
import { AboutTab } from '../components/AboutTab';
import { ContactTab } from '../components/ContactTab';
import Snackbar from '../../../components/ui/Snackbar';
import { Navigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { settings, loading, saving, updateSettings, uploadImage, removeImage } = useSettings();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  // Only admins can access settings
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = async (data, isImage = false) => {
    try {
      if (isImage) {
        // Handle image upload/removal
        const field = Object.keys(data)[0];
        const value = data[field];

        if (value === null) {
          await removeImage(field);
          showSuccess('Image removed successfully');
        } else if (value instanceof File) {
          await uploadImage(field, value);
          showSuccess('Image uploaded successfully');
        }
      } else {
        // Handle regular form data
        await updateSettings(data);
        showSuccess('Settings updated successfully');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      showError(err.response?.data?.detail || 'Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] text-[#383838] leading-none font-bold mb-2">
          System Settings
        </h1>
        <p className="text-[15px] text-[#A0A0A0]">
          Configure your church management system
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Settings tabs"
        variant="underline"
        onActiveTabChange={setActiveTab}
      >
        <Tabs.Item
          active={activeTab === 0}
          title="Branding"
          icon={HiOutlineCog}
        >
          <div className="py-6">
            <BrandingTab
              settings={settings}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === 1}
          title="About"
          icon={HiOutlineInformationCircle}
        >
          <div className="py-6">
            <AboutTab
              settings={settings}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </Tabs.Item>

        <Tabs.Item
          active={activeTab === 2}
          title="Contact"
          icon={HiOutlinePhone}
        >
          <div className="py-6">
            <ContactTab
              settings={settings}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        </Tabs.Item>
      </Tabs>

      {/* Snackbar */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </div>
  );
};

export default SettingsPage;
