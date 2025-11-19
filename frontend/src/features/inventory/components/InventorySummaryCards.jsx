import { HiOutlineChartPie, HiOutlineClipboardCheck, HiOutlineCube, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { Card } from '../../../components/ui/Card';
import { SBCC_COLORS } from '../../../store/theme.store';
import { formatCurrency } from '../utils';

const StatusBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1 rounded-2xl border border-sbcc-gray/20 bg-sbcc-cream px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-sbcc-dark">{label}</p>
        <span className="text-xs font-semibold text-sbcc-gray">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-white">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-xs text-sbcc-gray">
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
      accent: 'bg-sbcc-light-orange text-sbcc-dark',
    },
    {
      title: 'Net book value',
      value: formatCurrency(safeSummary.totalBookValue || 0),
      subtitle: `Original cost ${formatCurrency(safeSummary.totalAcquisitionCost || 0)}`,
      icon: HiOutlineCurrencyDollar,
      accent: 'bg-sbcc-orange text-white',
    },
    {
      title: 'Needs attention',
      value: safeSummary.needsAttention || 0,
      subtitle: `${safeSummary.fullyDepreciated || 0} fully depreciated`,
      icon: HiOutlineClipboardCheck,
      accent: 'bg-sbcc-dark-orange text-white',
    },
  ];

  return (
    <section className="space-y-6 print:hidden">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {quickCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-sbcc-gray/30 bg-white p-5 shadow-[0_20px_70px_rgba(56,56,56,0.08)]"
          >
            <div
              className={`mb-4 inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold ${card.accent}`}
            >
              <card.icon className="mr-2 h-5 w-5" />
              {card.title}
            </div>
            <p className="text-3xl font-bold text-sbcc-dark">{card.value}</p>
            <p className="text-sm text-sbcc-gray">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Status distribution"
          subtitle="Live breakdown across all tracked assets."
          className="border border-sbcc-gray/20 !bg-white"
        >
          <div className="mt-2 space-y-4">
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
        </Card>

        <Card
          title="Label highlights"
          subtitle="Track ownership source and ministry accountability."
          className="border border-sbcc-gray/20 !bg-white"
          headerActions={
            <span className="inline-flex items-center gap-2 rounded-full bg-sbcc-light-orange/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sbcc-dark">
              <HiOutlineChartPie className="h-4 w-4" />
              Access controlled
            </span>
          }
        >
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-sbcc-gray/20 bg-sbcc-cream px-5 py-4">
              <p className="text-xs font-semibold uppercase text-sbcc-gray">Donated</p>
              <p className="text-3xl font-bold text-sbcc-dark">
                {labelBreakdown?.donated || 0}
              </p>
              <p className="text-sm text-sbcc-gray">
                {totalLabelItems > 0
                  ? `${Math.round(((labelBreakdown?.donated || 0) / totalLabelItems) * 100)}% of total`
                  : 'No donated items yet'}
              </p>
            </div>
            <div className="rounded-3xl border border-sbcc-gray/20 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase text-sbcc-gray">Church-provided</p>
              <p className="text-3xl font-bold text-sbcc-dark">
                {labelBreakdown?.['church-provided'] || 0}
              </p>
              <p className="text-sm text-sbcc-gray">
                {totalLabelItems > 0
                  ? `${Math.round(
                      ((labelBreakdown?.['church-provided'] || 0) / totalLabelItems) * 100
                    )}% of total`
                  : 'No tagged items yet'}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-sbcc-gray/40 px-4 py-3 text-sm text-sbcc-gray">
            Ministry head access is required for editing financial details. Backend must enforce
            role-based permissions tied to each ministry assignment.
          </div>
        </Card>
      </div>
    </section>
  );
};

export default InventorySummaryCards;
