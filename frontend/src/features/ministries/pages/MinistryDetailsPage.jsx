import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Spinner, Tabs } from 'flowbite-react';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineUsers, HiOutlineClock, HiRefresh } from 'react-icons/hi';
import { ChevronLeft } from 'lucide-react';
import { useMinistryDetails } from '../hooks/useMinistryDetails';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
import { MinistryFormModal } from '../components/MinistryFormModal';
import { MinistryMembersTab } from '../components/MinistryMembersTab';
import { MinistryShiftsTab } from '../components/MinistryShiftsTab';
import { MinistryOverviewTab } from '../components/MinistryOverviewTab';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { SecondaryButton } from '../../../components/ui/Button';
import { ShiftRotationModal } from '../components/ShiftRotationModal';
import Snackbar from '../../../components/ui/Snackbar';

export const MinistryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = usePermissionWarning('ministry_details', { label: 'Ministry Details' });
  const { ministry, loading, refresh, updateMinistry, deleteMinistry } = useMinistryDetails(id);
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();
  const canManage = canWrite;

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rotationModalOpen, setRotationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleUpdate = async (data) => {
    try {
      await updateMinistry(data);
      setEditModal(false);
      showSuccess('Ministry updated successfully');
    } catch (err) {
      showError('Failed to update ministry');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMinistry();
      showSuccess('Ministry deleted successfully');
      navigate('/ministries');
    } catch (err) {
      showError('Failed to delete ministry');
    }
  };

  const handleStatsRefresh = () => {
    refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="xl" />
            <p className="mt-3 text-gray-500">Loading ministry details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!ministry) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Ministry not found</p>
            <Link
              to="/ministries"
              className="mt-4 text-[#FDB54A] hover:underline inline-block"
            >
              ← Back to Ministries
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Navigation */}
        <Link
          to="/ministries"
          className="inline-flex items-center text-sm text-[#FDB54A] font-medium hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Ministries
        </Link>

        {/* Ministry Info + Actions Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {ministry.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {ministry.description || 'No description provided'}
                </p>
              </div>
              {canManage && (
                <div className="flex items-center gap-2">
                  <SecondaryButton
                    icon={HiRefresh}
                    onClick={() => setRotationModalOpen(true)}
                    size="sm"
                  >
                    Rotate Shifts
                  </SecondaryButton>
                  <button
                    onClick={() => setEditModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit Ministry"
                  >
                    <HiOutlinePencil className="w-5 h-5 text-[#FDB54A]" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Delete Ministry"
                  >
                    <HiOutlineTrash className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <HiOutlineUsers className="w-5 h-5 text-emerald-600" />
                <p className="text-2xl font-bold text-gray-900">{ministry.active_member_count || 0}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Active Members</p>
            </div>
            <div className="px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <HiOutlineUsers className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-bold text-gray-900">{ministry.member_count || 0}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Members</p>
            </div>
            <div className="px-5 py-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-[#FDB54A]" />
                <p className="text-2xl font-bold text-gray-900">{ministry.upcoming_shifts?.length || 0}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Upcoming Shifts</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <Tabs
            aria-label="Ministry tabs"
            variant="underline"
            onActiveTabChange={(tab) => setActiveTab(tab)}
          >
            <Tabs.Item active title="Overview">
              <MinistryOverviewTab ministry={ministry} onRefresh={handleStatsRefresh} />
            </Tabs.Item>
            <Tabs.Item title="Members">
              <MinistryMembersTab
                ministry={ministry}
                canManage={canManage}
                onRefresh={handleStatsRefresh}
              />
            </Tabs.Item>
            <Tabs.Item title="Shifts">
              <MinistryShiftsTab
                ministryId={ministry.id}
                ministry={ministry}
                canManage={canManage}
                onRefresh={handleStatsRefresh}
              />
            </Tabs.Item>
          </Tabs>
        </div>

        {/* Edit Modal */}
        <MinistryFormModal
          open={editModal}
          ministry={ministry}
          onClose={() => setEditModal(false)}
          onSubmit={handleUpdate}
          loading={loading}
        />

        {/* Delete Modal */}
        <ConfirmationModal
          open={deleteModal}
          title="Delete Ministry?"
          message={`Are you sure you want to delete "${ministry.name}"? This will also remove all associated members, shifts, and assignments. This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(false)}
          loading={loading}
        />

        {/* Shift Rotation Modal */}
        <ShiftRotationModal
          open={rotationModalOpen}
          onClose={() => setRotationModalOpen(false)}
          ministry={ministry}
          onSuccess={handleStatsRefresh}
        />

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
    </main>
  );
};

export default MinistryDetailsPage;
