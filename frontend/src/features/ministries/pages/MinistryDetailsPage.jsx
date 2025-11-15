import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Tabs } from 'flowbite-react';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineClock,
  HiRefresh,
  HiInformationCircle,
  HiUsers,
  HiCalendar,
  HiChartBar
} from 'react-icons/hi';
import { useAuth } from '../../auth/hooks/useAuth';
import { ministriesApi } from '../../../api/ministries.api';
import { MinistryFormModal } from '../components/MinistryFormModal';
import MinistryMembersTab from '../components/MinistryMembersTab';
import { MinistryShiftsTab } from '../components/MinistryShiftsTab';
import { MinistryOverviewTab } from '../components/MinistryOverviewTab';
import { ConfirmationModal } from '../../../components/ui/Modal';
import Snackbar from '../../../components/ui/Snackbar';
import { useSnackbar } from '../../../hooks/useSnackbar';
import ShiftRotationModal from '../components/ShiftRotationModal';
import { SecondaryButton } from '../../../components/ui/Button';

const MANAGER_ROLES = ['admin', 'pastor', 'staff'];

export const MinistryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);
  const { snackbar, hideSnackbar } = useSnackbar();

  const [ministry, setMinistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rotationModalOpen, setRotationModalOpen] = useState(false);

  const fetchMinistry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ministriesApi.getMinistry(id);
      setMinistry(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load ministry details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMinistry();
  }, [fetchMinistry]);

  const handleUpdate = useCallback(async (data) => {
    try {
      await ministriesApi.updateMinistry(id, data);
      await fetchMinistry();
      setEditModal(false);
    } catch (err) {
      console.error('Update error:', err);
      throw err;
    }
  }, [id, fetchMinistry]);

  const handleDelete = useCallback(async () => {
    try {
      await ministriesApi.deleteMinistry(id);
      navigate('/ministries');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.detail || 'Unable to delete ministry');
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-[95%] mx-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="xl" />
          <p className="mt-3 text-[#A0A0A0]">Loading ministry details...</p>
        </div>
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="max-w-[95%] mx-auto p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-red-800">{error || 'Ministry not found'}</p>
          <button
            onClick={() => navigate('/ministries')}
            className="mt-4 text-[#FDB54A] hover:underline"
          >
            ← Back to Ministries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/ministries')}
          className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#383838] mb-2 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          <span className="text-[15px]">Back to Ministries</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[30px] text-[#383838] leading-none font-bold mb-2">
              {ministry.name}
            </h1>
            <p className="text-[15px] text-[#A0A0A0]">
              {ministry.description || 'No description provided'}
            </p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <>
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
                  <HiOutlinePencil className="w-5 h-5 text-[#FFB039]" />
                </button>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Delete Ministry"
                >
                  <HiOutlineTrash className="w-5 h-5 text-[#E55050]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDB54A] bg-opacity-10 rounded-lg">
              <HiOutlineUsers className="w-6 h-6 text-[#FDB54A]" />
            </div>
            <div>
              <p className="text-[14px] text-[#A0A0A0]">Active Members</p>
              <p className="text-[24px] font-bold text-[#383838]">
                {ministry.active_member_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDB54A] bg-opacity-10 rounded-lg">
              <HiOutlineUsers className="w-6 h-6 text-[#FDB54A]" />
            </div>
            <div>
              <p className="text-[14px] text-[#A0A0A0]">Total Members</p>
              <p className="text-[24px] font-bold text-[#383838]">
                {ministry.member_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDB54A] bg-opacity-10 rounded-lg">
              <HiOutlineClock className="w-6 h-6 text-[#FDB54A]" />
            </div>
            <div>
              <p className="text-[14px] text-[#A0A0A0]">Upcoming Shifts</p>
              <p className="text-[24px] font-bold text-[#383838]">
                {ministry.upcoming_shifts?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-[2px_2px_10px_rgba(0,0,0,0.15)] p-6">
        <Tabs
          aria-label="Ministry tabs"
          variant="underline"
          onActiveTabChange={(tab) => setActiveTab(tab)}
        >
          <Tabs.Item active title="Overview">
            <MinistryOverviewTab ministry={ministry} onRefresh={fetchMinistry} />
          </Tabs.Item>
          <Tabs.Item title="Members">
            <MinistryMembersTab
              ministry={ministry}
              canManage={canManage}
              onRefresh={fetchMinistry}
            />
          </Tabs.Item>
          <Tabs.Item title="Shifts">
            <MinistryShiftsTab
              ministryId={ministry.id}
              canManage={canManage}
              onRefresh={fetchMinistry}
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
  );
};

export default MinistryDetailsPage;
