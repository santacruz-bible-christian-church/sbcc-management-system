import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMinistries } from '../hooks/useMinistries';
import { MinistryCard } from '../components/MinistryCard';
import { MinistryFormModal } from '../components/MinistryFormModal';
import { MinistryToolbar } from '../components/MinistryToolbar';
import { MinistrySkeleton } from '../components/MinistrySkeleton';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { Pagination, EmptyState } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { ministriesApi } from '../../../api/ministries.api';

const MANAGER_ROLES = ['super_admin', 'admin', 'pastor', 'ministry_leader'];

export const MinistriesPage = () => {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);
  const navigate = useNavigate();

  const {
    ministries,
    loading,
    error,
    pagination,
    setSearch,
    goToPage,
    createMinistry,
    updateMinistry,
    deleteMinistry,
  } = useMinistries();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModal, setFormModal] = useState({ open: false, ministry: null });
  const [deleteState, setDeleteState] = useState({ open: false, ministry: null });

  // Stats state
  const [stats, setStats] = useState({
    total_ministries: 0,
    total_members: 0,
    active_shifts: 0,
    total_assignments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await ministriesApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, ministries]);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setSearch(value);
  }, [setSearch]);

  const openCreateModal = useCallback(() => {
    setFormModal({ open: true, ministry: null });
  }, []);

  const openEditModal = useCallback((ministry) => {
    setFormModal({ open: true, ministry });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModal({ open: false, ministry: null });
  }, []);

  const handleFormSubmit = useCallback(async (data) => {
    if (formModal.ministry) {
      await updateMinistry(formModal.ministry.id, data);
    } else {
      await createMinistry(data);
    }
    fetchStats();
  }, [formModal.ministry, createMinistry, updateMinistry, fetchStats]);

  const openDeleteModal = useCallback((ministry) => {
    setDeleteState({ open: true, ministry });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, ministry: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.ministry) return;

    try {
      await deleteMinistry(deleteState.ministry.id);
      closeDeleteModal();
      fetchStats();
    } catch (err) {
      console.error('Delete ministry error:', err);
    }
  }, [deleteState.ministry, deleteMinistry, closeDeleteModal, fetchStats]);

  const handleViewDetails = useCallback((ministry) => {
    navigate(`/ministries/${ministry.id}`);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Toolbar */}
        <MinistryToolbar
          stats={stats}
          statsLoading={statsLoading}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onCreateClick={openCreateModal}
          canManage={canManage}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Content */}
        {loading && ministries.length === 0 ? (
          <MinistrySkeleton />
        ) : ministries.length === 0 ? (
          <EmptyState
            message="No ministries found"
            actionLabel={canManage ? "Create Your First Ministry" : undefined}
            onAction={canManage ? openCreateModal : undefined}
          />
        ) : (
          <>
            {/* Loading overlay for subsequent loads */}
            <div className={`relative ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ministries.map((ministry) => (
                  <MinistryCard
                    key={ministry.id}
                    ministry={ministry}
                    canManage={canManage}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={goToPage}
              hasNext={!!pagination.next}
              hasPrevious={!!pagination.previous}
            />

            {/* Results Info */}
            {pagination.count > 0 && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Showing {Math.min((pagination.currentPage - 1) * 10 + 1, pagination.count)} - {Math.min(pagination.currentPage * 10, pagination.count)} of {pagination.count} ministries
              </div>
            )}
          </>
        )}

        {/* Form Modal */}
        <MinistryFormModal
          open={formModal.open}
          ministry={formModal.ministry}
          onClose={closeFormModal}
          onSubmit={handleFormSubmit}
          loading={loading}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={deleteState.open}
          title="Delete Ministry?"
          message={`Are you sure you want to delete "${deleteState.ministry?.name}"? This will also remove all associated members, shifts, and assignments. This action cannot be undone.`}
          illustration={TrashIllustration}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={closeDeleteModal}
          loading={loading}
        />
      </div>
    </main>
  );
};

export default MinistriesPage;
