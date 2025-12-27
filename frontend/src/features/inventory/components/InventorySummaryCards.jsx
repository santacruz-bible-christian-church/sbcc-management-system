import { HiOutlineChartPie, HiOutlineClipboardCheck, HiOutlineCube, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { SBCC_COLORS } from '../../../store/theme.store';
import { formatCurrency } from '../utils';

const StatusBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <span className="text-xs font-semibold text-gray-500">{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {value} {value === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
};


export const InventorySummaryCards = ({
  summary,
  statusBreakdown,
  labelBreakdown,
}) => {
  const safeSummary = summary || {};
  const totalStatusItems = Object.values(statusBreakdown || {}).reduce(
    (acc, value) => acc + value,
    0
  );
  const totalLabelItems = Object.values(labelBreakdown || {}).reduce(
    (acc, value) => acc + value,
    0
  );

  const quickCards = [
    {
      title: 'Assets tracked',
      value: safeSummary.totalItems || 0,
      subtitle: `${safeSummary.totalQuantity || 0} pcs on hand`,
      icon: HiOutlineCube,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Net book value',
      value: formatCurrency(safeSummary.totalBookValue || 0),
      subtitle: `Original cost ${formatCurrency(safeSummary.totalAcquisitionCost || 0)}`,
      icon: HiOutlineCurrencyDollar,
      accent: 'bg-green-100 text-green-700',
    },
    {
      title: 'Needs attention',
      value: safeSummary.needsAttention || 0,
      subtitle: `${safeSummary.fullyDepreciated || 0} fully depreciated`,
      icon: HiOutlineClipboardCheck,
      accent: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <section className="space-y-4 print:hidden">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quickCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${card.accent}`}
            >
              <card.icon className="h-4 w-4" />
              {card.title}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">Status distribution</h3>
          <p className="text-sm text-gray-500 mb-4">Breakdown across all tracked assets</p>
          <div className="space-y-3">
            <StatusBar
              label="Good / Working"
              value={statusBreakdown?.good || 0}
              total={totalStatusItems}
              color={SBCC_COLORS.success}
            />
            <StatusBar
              label="Needs Repair"
              value={statusBreakdown?.needs_repair || 0}
              total={totalStatusItems}
              color={SBCC_COLORS.warning}
            />
            <StatusBar
              label="Retired / Disposed"
              value={statusBreakdown?.retired || 0}
              total={totalStatusItems}
              color={SBCC_COLORS.info}
            />
            <StatusBar
              label="Lost"
              value={statusBreakdown?.lost || 0}
              total={totalStatusItems}
              color={SBCC_COLORS.danger}
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Label highlights</h3>
              <p className="text-sm text-gray-500">Ownership source breakdown</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              <HiOutlineChartPie className="h-3 w-3" />
              Access controlled
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase text-gray-500">Donated</p>
              <p className="text-2xl font-bold text-gray-900">
                {labelBreakdown?.donated || 0}
              </p>
              <p className="text-sm text-gray-500">
                {totalLabelItems > 0
                  ? `${Math.round(((labelBreakdown?.donated || 0) / totalLabelItems) * 100)}% of total`
                  : 'No donated items yet'}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase text-gray-500">Church-provided</p>
              <p className="text-2xl font-bold text-gray-900">
                {labelBreakdown?.['church-provided'] || 0}
              </p>
              <p className="text-sm text-gray-500">
                {totalLabelItems > 0
                  ? `${Math.round(
                      ((labelBreakdown?.['church-provided'] || 0) / totalLabelItems) * 100
                    )}% of total`
                  : 'No tagged items yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventorySummaryCards;
