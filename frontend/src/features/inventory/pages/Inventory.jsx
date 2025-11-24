import { useState } from 'react';
import { Spinner } from 'flowbite-react';
import {
  HiOutlineDownload,
  HiOutlinePlusCircle,
  HiOutlinePrinter,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import Snackbar from '../../../components/ui/Snackbar';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../auth/hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import {
  InventoryFilters,
  InventoryForm,
  InventoryModal,
  InventoryStickerSheet,
  InventorySummaryCards,
  InventoryTable,
} from '../components';

const InventoryPage = () => {
  const { user } = useAuth();
  const {
    filteredItems,
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
  } = useInventory();

  const {
    snackbar,
    showSuccess,
    showError,
    hideSnackbar,
  } = useSnackbar();

  const [formState, setFormState] = useState({ open: false, mode: 'create', item: null });
  const [deleteState, setDeleteState] = useState({ open: false, item: null });
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

  const handleDownloadReport = async () => {
    try {
      await downloadReport();
      showSuccess('Depreciation report download started.');
    } catch (err) {
      showError('Unable to generate the report. Ensure the backend endpoint is reachable.');
    }
  };

  const handlePrintStickers = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-sbcc-cream px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-sbcc-gray/20 bg-white px-6 py-6 shadow-[0_20px_70px_rgba(56,56,56,0.08)] print:hidden md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sbcc-gray">
              Inventory tracking
            </p>
            <h1 className="text-3xl font-bold text-sbcc-dark">Asset register</h1>
            <p className="text-sm text-sbcc-gray">
              Manage acquisition costs, depreciation, and QR labels for every equipment.
            </p>
            {user?.role && (
              <p className="mt-2 text-xs text-sbcc-gray">
                Signed in as{' '}
                <span className="font-semibold text-sbcc-dark">{user.role}</span> -- backend must
                enforce ministry-head permissions for edits.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SecondaryButton icon={HiOutlineRefresh} onClick={refresh} disabled={loading}>
              Refresh
            </SecondaryButton>
            <SecondaryButton icon={HiOutlineDownload} onClick={handleDownloadReport}>
              Depreciation PDF
            </SecondaryButton>
            <SecondaryButton icon={HiOutlinePrinter} onClick={handlePrintStickers}>
              Print stickers
            </SecondaryButton>
            <PrimaryButton icon={HiOutlinePlusCircle} onClick={openCreate}>
              Add Asset
            </PrimaryButton>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-[color:var(--sbcc-danger)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--sbcc-danger)] print:hidden">
            {error}
          </div>
        )}

        <section className="space-y-8 print:hidden">
          {loading && !filteredItems.length ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-sbcc-gray/20 bg-white px-6 py-10 text-sbcc-gray">
              <Spinner size="xl" />
              <p className="mt-3 text-sm font-semibold">Loading inventory data...</p>
            </div>
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

              <InventoryTable
                items={filteredItems}
                loading={loading}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            </>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 print:hidden md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-sbcc-gray">
                Printable sticker markings
              </p>
              <h2 className="text-2xl font-bold text-sbcc-dark">
                QR-ready labels for on-site audits
              </h2>
              <p className="text-sm text-sbcc-gray">
                Only this grid is visible when printing so you can generate sticker sheets.
              </p>
            </div>
            <SecondaryButton icon={HiOutlinePrinter} onClick={handlePrintStickers}>
              Print current view
            </SecondaryButton>
          </div>

          <InventoryStickerSheet items={filteredItems} />
        </section>
      </div>
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
        confirmText="Delete asset"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDelete}
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
    </div>
  );
};

export default InventoryPage;

