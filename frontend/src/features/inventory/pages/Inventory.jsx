import { useState } from 'react';
import {
  HiOutlineDownload,
  HiOutlinePlusCircle,
  HiOutlinePrinter,
  HiOutlineRefresh,
} from 'react-icons/hi';
import Snackbar from '../../../components/ui/Snackbar';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePermissionWarning } from '../../../hooks/usePermissionWarning';
import { useInventory } from '../hooks/useInventory';
import TrashIllustration from '../../../assets/Trash-WarmTone.svg';
import { printStickersPDF } from '../utils/stickersPDF';
import {
  InventoryFilters,
  InventoryForm,
  InventoryModal,
  InventoryStickerSheet,
  InventorySummaryCards,
  InventoryTable,
} from '../components';
import InventorySkeleton from '../components/InventorySkeleton';
import DateRangeExportModal from '../components/DateRangeExportModal';
import InventoryPagination from '../components/InventoryPagination';

const InventoryPage = () => {
  const { canWrite } = usePermissionWarning('inventory', { label: 'Inventory' });
  const {
    filteredItems,
    paginatedItems,
    loading,
    error,
    filters,
    search,
    summary,
    statusBreakdown,
    labelBreakdown,
    ministryOptions,
    setFilters,
    setSearch,
    resetFilters,
    refresh,
    createItem,
    updateItem,
    deleteItem,
    downloadReport,
    pagination,
  } = useInventory();

  const {
    snackbar,
    showSuccess,
    showError,
    hideSnackbar,
  } = useSnackbar();

  const [formState, setFormState] = useState({ open: false, mode: 'create', item: null });
  const [deleteState, setDeleteState] = useState({ open: false, item: null });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreate = () => setFormState({ open: true, mode: 'create', item: null });
  const openEdit = (item) => setFormState({ open: true, mode: 'edit', item });
  const closeForm = () => setFormState({ open: false, mode: 'create', item: null });

  const openDelete = (item) => setDeleteState({ open: true, item });
  const closeDelete = () => setDeleteState({ open: false, item: null });

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (formState.mode === 'create') {
        await createItem(payload);
        showSuccess('Inventory item added successfully.');
      } else if (formState.item?.id) {
        await updateItem(formState.item.id, payload);
        showSuccess('Inventory item updated.');
      }
      closeForm();
    } catch (err) {
      showError(err.response?.data?.detail || 'Unable to save inventory item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.item) return;
    setSubmitting(true);
    try {
      await deleteItem(deleteState.item.id);
      showSuccess('Inventory item removed.');
      closeDelete();
    } catch (err) {
      showError(err.response?.data?.detail || 'Unable to delete inventory item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReport = async (dateRange = {}) => {
    try {
      await downloadReport(dateRange);
      showSuccess('Depreciation report download started.');
      setExportModalOpen(false);
    } catch (err) {
      showError('Unable to generate the report.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Unified Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <HiOutlineRefresh className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Asset Register</h2>
              <p className="text-sm text-gray-500">
                {summary?.totalItems || 0} assets • {summary?.totalQuantity || 0} pcs on hand
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <HiOutlineDownload className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => printStickersPDF(filteredItems)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <HiOutlinePrinter className="w-4 h-4" />
              Print Labels
            </button>
            {canWrite && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FDB54A] hover:bg-[#e5a43b] rounded-lg transition-colors"
              >
                <HiOutlinePlusCircle className="w-4 h-4" />
                Add Asset
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 print:hidden">
            {error}
          </div>
        )}

        {/* Main Content */}
        <section className="space-y-6 print:hidden relative">
          {/* Loading Overlay for Refresh */}
          {loading && filteredItems.length > 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-700">Refreshing...</span>
              </div>
            </div>
          )}

          {loading && !filteredItems.length ? (
            <InventorySkeleton />
          ) : (
            <>
              <InventorySummaryCards
                summary={summary}
                statusBreakdown={statusBreakdown}
                labelBreakdown={labelBreakdown}
              />

              <InventoryFilters
                filters={filters}
                search={search}
                ministryOptions={ministryOptions}
                onSearchChange={setSearch}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
              />

              {/* Inventory Table with Pagination - wrapped in same container */}
              <div className="rounded-3xl border border-sbcc-gray/20 bg-white shadow-[0_20px_70px_rgba(56,56,56,0.08)] overflow-hidden">
                <InventoryTable
                  items={paginatedItems}
                  loading={loading}
                  onEdit={canWrite ? openEdit : undefined}
                  onDelete={canWrite ? openDelete : undefined}
                  canWrite={canWrite}
                />

                {/* Pagination Controls - inside table container */}
                {filteredItems.length > 0 && (
                  <InventoryPagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.goToPage}
                    onPageSizeChange={pagination.changePageSize}
                  />
                )}
              </div>
            </>
          )}
        </section>

        {/* Sticker Labels Section - synced with table pagination */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 print:hidden">
          <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">QR Label Preview</h2>
              <p className="text-sm text-gray-500">
                Showing stickers for current table page ({paginatedItems.length} items)
              </p>
            </div>
          </div>
          <InventoryStickerSheet items={paginatedItems} />
        </section>
      </div>

      {/* Modals */}
      <InventoryModal
        open={formState.open}
        title={formState.mode === 'create' ? 'Add asset' : 'Update asset'}
        onClose={closeForm}
      >
        <InventoryForm
          initialValues={formState.item}
          submitting={submitting}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
          ministryOptions={ministryOptions}
        />
      </InventoryModal>

      <ConfirmationModal
        open={deleteState.open}
        title="Delete asset?"
        message={`Are you sure you want to delete "${deleteState.item?.item_name || ''}"? This action cannot be undone.`}
        illustration={TrashIllustration}
        confirmText="Delete asset"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDelete}
        loading={submitting}
      />

      {/* Date Range Export Modal */}
      <DateRangeExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleDownloadReport}
        loading={submitting}
      />

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          variant={snackbar.variant}
          duration={snackbar.duration}
          onClose={hideSnackbar}
        />
      )}
    </main>
  );
};

export default InventoryPage;
