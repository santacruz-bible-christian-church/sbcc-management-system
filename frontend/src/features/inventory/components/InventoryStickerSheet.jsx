import { QRCodeCanvas } from 'qrcode.react';
import { formatLabel } from '../utils';

/**
 * Display inventory stickers as a preview grid
 * For printing, use the Print Labels button which generates a professional PDF
 */
export const InventoryStickerSheet = ({ items }) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-500">
        No items to display. Add or filter assets to see labels here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <div className="flex-shrink-0">
            <QRCodeCanvas
              value={`SBCC-INV-${item.id}`}
              size={56}
              bgColor="#FFFFFF"
              fgColor="#000000"
              includeMargin={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.item_name}</p>
            <p className="text-xs text-gray-600">ID: #{item.id}</p>
            <p className="text-xs text-gray-600">
              {formatLabel(item.label)} • Qty: {item.quantity || item.metrics?.quantity || 1}
            </p>
            <p className="text-xs text-gray-500 truncate">{item.ministry_name || 'Unassigned'}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStickerSheet;
