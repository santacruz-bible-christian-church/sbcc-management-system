import { SBCC_COLORS } from '../../../store/theme.store';

export const DEFAULT_FILTERS = {
  status: 'all',
  label: 'all',
  ministry: 'all',
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'good', label: 'Good / Working' },
  { value: 'needs_repair', label: 'Needs Repair' },
  { value: 'retired', label: 'Retired / Disposed' },
  { value: 'lost', label: 'Lost' },
];

export const LABEL_OPTIONS = [
  { value: 'all', label: 'All labels' },
  { value: 'donated', label: 'Donated' },
  { value: 'church-provided', label: 'Church-Provided' },
];

const NUMBER_FORMATTER = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const NUMBER_SAFE = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const normalizeInventoryResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload?.results && Array.isArray(payload.results)) {
    return payload.results;
  }
  if (payload && typeof payload === 'object') {
    return [payload];
  }
  return [];
};

export const calculateItemMetrics = (item) => {
  const quantity = NUMBER_SAFE(item.quantity) || 0;
  const acquisitionCost = NUMBER_SAFE(item.acquisition_cost);
  const salvageValue = NUMBER_SAFE(item.salvage_value);
  const usefulLifeYears = NUMBER_SAFE(item.useful_life_years);
  const acquisitionDate = item.acquisition_date ? new Date(item.acquisition_date) : null;

  const depreciableBase = Math.max(acquisitionCost - salvageValue, 0);
  const annualDepreciationPerUnit = usefulLifeYears > 0 ? depreciableBase / usefulLifeYears : 0;

  let yearsUsed = 0;
  if (acquisitionDate) {
    const diff = Date.now() - acquisitionDate.getTime();
    yearsUsed = diff > 0 ? diff / (1000 * 60 * 60 * 24 * 365) : 0;
  }

  const accumulatedPerUnit = Math.min(
    depreciableBase,
    Math.max(annualDepreciationPerUnit * yearsUsed, 0)
  );
  const bookValuePerUnit = Math.max(acquisitionCost - accumulatedPerUnit, 0);

  return {
    quantity,
    acquisitionDate,
    depreciableBase,
    annualDepreciationPerUnit,
    accumulatedPerUnit,
    bookValuePerUnit,
    totalBookValue: bookValuePerUnit * quantity,
    totalAcquisitionCost: acquisitionCost * quantity,
    depreciationPercent: depreciableBase > 0
      ? Math.min((accumulatedPerUnit / depreciableBase) * 100, 100)
      : 0,
    fullyDepreciated: depreciableBase > 0 && bookValuePerUnit <= 0.5,
  };
};

export const summarizeInventory = (items) => {
  const base = {
    totalItems: items.length,
    totalQuantity: 0,
    totalBookValue: 0,
    totalAcquisitionCost: 0,
    donatedCount: 0,
    churchProvidedCount: 0,
    needsAttention: 0,
    fullyDepreciated: 0,
  };

  return items.reduce((summary, item) => {
    const metrics = item.metrics;
    summary.totalQuantity += metrics.quantity;
    summary.totalBookValue += metrics.totalBookValue;
    summary.totalAcquisitionCost += metrics.totalAcquisitionCost;

    if (item.label === 'donated') summary.donatedCount += 1;
    if (item.label === 'church-provided') summary.churchProvidedCount += 1;
    if (item.status && item.status !== 'good') summary.needsAttention += 1;
    if (metrics.fullyDepreciated) summary.fullyDepreciated += 1;

    return summary;
  }, base);
};

export const buildStatusBreakdown = (items) => {
  return items.reduce(
    (acc, item) => {
      const key = item.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );
};

export const buildLabelBreakdown = (items) => {
  return items.reduce(
    (acc, item) => {
      const key = item.label || 'unlabeled';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );
};

export const formatCurrency = (value = 0) => NUMBER_FORMATTER.format(value || 0);

export const formatDate = (value) => {
  if (!value) return '--';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return DATE_FORMATTER.format(date);
};

export const formatLabel = (value) => {
  if (!value) return 'Unlabeled';
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

export const STATUS_META = {
  good: {
    label: 'Good / Working',
    color: SBCC_COLORS.success,
  },
  needs_repair: {
    label: 'Needs Repair',
    color: SBCC_COLORS.warning,
  },
  retired: {
    label: 'Retired / Disposed',
    color: SBCC_COLORS.info,
  },
  lost: {
    label: 'Lost',
    color: SBCC_COLORS.danger,
  },
};
