import { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { SBCC_COLORS } from '../../../store/theme.store';
import { formatLabel } from '../utils';

export const InventoryStickerSheet = forwardRef(({ items }, ref) => {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-sbcc-gray/40 bg-sbcc-cream px-6 py-12 text-center text-sbcc-gray">
        Nothing to print yet. Add or filter to a subset of assets and try again.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-4 rounded-3xl border border-sbcc-gray/20 bg-white p-6 shadow-[0_20px_70px_rgba(56,56,56,0.08)] print:bg-white print:shadow-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center gap-3 rounded-2xl border border-sbcc-gray/30 bg-sbcc-cream px-4 py-5 text-center text-sbcc-dark print:border-sbcc-dark"
        >
          <QRCodeCanvas
            value={`SBCC-INV-${item.id}`}
            size={96}
            bgColor={SBCC_COLORS.fill.white}
            fgColor={SBCC_COLORS.accent}
            includeMargin={false}
          />
          <div className="space-y-1">
            <p className="text-base font-semibold text-sbcc-dark">{item.item_name}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-sbcc-gray">
              {formatLabel(item.label)} | Qty {item.metrics.quantity}
            </p>
            <p className="text-xs text-sbcc-gray">
              ID #{item.id} | {item.ministry_name || 'Ministry TBD'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

InventoryStickerSheet.displayName = 'InventoryStickerSheet';

export default InventoryStickerSheet;
