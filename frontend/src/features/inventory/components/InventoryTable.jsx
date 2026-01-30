import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { formatCurrency, formatDate, formatLabel, STATUS_META } from '../utils';

const StatusPill = ({ status }) => {
  if (!status) {
    return (
      <span className="rounded-full border border-dashed border-sbcc-gray/40 px-3 py-1 text-xs font-semibold uppercase text-sbcc-gray">
        Unknown
      </span>
    );
  }

  const meta = STATUS_META[status] || {
    label: status,
    color: 'var(--sbcc-dark-orange)',
  };

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{
        color: meta.color,
        borderColor: meta.color,
        backgroundColor: `${meta.color}1a`,
      }}
    >
      {meta.label}
    </span>
  );
};

export const InventoryTable = ({ items, loading, onEdit, onDelete }) => {
  const hasActions = typeof onEdit === 'function' || typeof onDelete === 'function';

  return (
    <div className="print:hidden">
      <div className="flex items-center justify-between border-b border-sbcc-gray/10 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-sbcc-dark">Inventory list</h2>
          <p className="text-sm text-sbcc-gray">Financial and lifecycle view for every asset.</p>
        </div>
        <div className="rounded-full bg-sbcc-light-orange/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-sbcc-dark">
          {items.length} items
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-sbcc-gray/20 text-sm text-sbcc-dark">
          <thead className="bg-sbcc-cream/80 text-xs uppercase text-sbcc-gray">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Asset</th>
              <th className="px-6 py-4 text-left font-semibold">Lifecycle</th>
              <th className="px-6 py-4 text-left font-semibold">Financials</th>
              <th className="px-6 py-4 text-left font-semibold">Notes</th>
              {hasActions && (
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-sbcc-gray/10">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-sbcc-cream/70">
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-sbcc-dark">{item.item_name}</p>
                    <p className="text-xs font-semibold text-sbcc-gray">{formatLabel(item.label)}</p>
                    <p className="text-xs text-sbcc-gray">
                      Qty {item.metrics.quantity} | {item.ministry_name || 'Unassigned'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="space-y-2">
                    <StatusPill status={item.status} />
                    <p className="text-xs text-sbcc-gray">
                      Acquired {formatDate(item.acquisition_date)}
                    </p>
                    <p className="text-xs text-sbcc-gray">
                      Useful life: {item.useful_life_years || '--'} yrs
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="space-y-1 text-sm text-sbcc-dark">
                    <p>
                      Cost:&nbsp;
                      <span className="font-semibold">
                        {formatCurrency(item.metrics.totalAcquisitionCost || 0)}
                      </span>
                    </p>
                    <p>
                      Book value:&nbsp;
                      <span className="font-semibold">
                        {formatCurrency(item.metrics.totalBookValue || 0)}
                      </span>
                    </p>
                    <p className="text-xs text-sbcc-gray">
                      {item.metrics.depreciationPercent.toFixed(0)}% depreciated
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <p className="text-sm text-sbcc-dark">
                    {item.description || '--'}
                  </p>
                  <p className="text-xs text-sbcc-gray">{item.remarks || 'No remarks'}</p>
                </td>
                {hasActions && (
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      {typeof onEdit === 'function' && (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="rounded-full border border-sbcc-gray/40 bg-white p-2 text-sbcc-dark transition hover:border-[color:var(--sbcc-primary)] hover:text-sbcc-dark"
                          aria-label={`Edit ${item.item_name}`}
                        >
                          <HiOutlinePencilAlt className="h-5 w-5" />
                        </button>
                      )}
                      {typeof onDelete === 'function' && (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="rounded-full border border-sbcc-gray/40 bg-white p-2 text-[color:var(--sbcc-danger)] transition hover:border-[color:var(--sbcc-danger)]"
                          aria-label={`Delete ${item.item_name}`}
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-sbcc-gray">
            {loading ? (
              <p>Loading inventory data...</p>
            ) : (
              <>
                <p className="text-base font-semibold text-sbcc-dark">
                  No inventory records match your filters
                </p>
                <p className="text-sm">
                  Try resetting filters or add a new asset using the button above.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
