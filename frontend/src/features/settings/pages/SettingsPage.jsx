import { useState } from 'react';
import { Tabs } from 'flowbite-react';
import { HiOutlineCog, HiOutlineInformationCircle, HiOutlinePhone, HiOutlineUser, HiOutlineUserGroup } from 'react-icons/hi';
import { useSettings } from '../hooks/useSettings';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
import { BrandingTab } from '../components/BrandingTab';
import { AboutTab } from '../components/AboutTab';
import { ContactTab } from '../components/ContactTab';
import { TeamTab } from '../components/TeamTab';
import { ProfileTab } from '../components/ProfileTab';
import { SettingsPreview } from '../components/SettingsPreview';
import { SettingsSkeleton } from '../components/SettingsSkeleton';
import Snackbar from '../../../components/ui/Snackbar';

export const SettingsPage = () => {
  const { canWrite, user } = usePermissionWarning('settings', { label: 'Settings' });
  const { settings, loading, saving, refresh, updateSettings, uploadImage, removeImage } = useSettings();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  // Check if user can modify system settings (branding, about, contact)
  const canEditSystemSettings = canWrite;

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
      // Refresh preview and notify other components
      await refresh();

      // Import and trigger global settings refresh
      const { refreshPublicSettings } = await import('../hooks/usePublicSettings');
      refreshPublicSettings();
    } catch (err) {
      console.error('Failed to update settings:', err);
      showError(err.response?.data?.detail || 'Failed to update settings');
    }
  };

  if (loading && canEditSystemSettings) {
    return <SettingsSkeleton />;
  }

  // If user can only access profile, show simplified view
  if (!canEditSystemSettings) {
    return (
      <div className="max-w-[95%] mx-auto p-4 md:p-6">
        {/* Profile Only */}
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ProfileTab
              user={user}
              saving={saving}
            />
          </div>
        </div>

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
  }

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-6">
      {/* Two Column Layout: Tabs + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
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

            <Tabs.Item
              active={activeTab === 3}
              title="Team"
              icon={HiOutlineUserGroup}
            >
              <div className="py-6">
                <TeamTab
                  onSuccess={showSuccess}
                  onError={showError}
                />
              </div>
            </Tabs.Item>

            <Tabs.Item
              active={activeTab === 4}
              title="Profile"
              icon={HiOutlineUser}
            >
              <div className="py-6">
                <ProfileTab
                  user={user}
                  saving={saving}
                />
              </div>
            </Tabs.Item>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <SettingsPreview
            settings={settings}
            onRefresh={refresh}
            loading={loading}
          />
        </div>
      </div>

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
