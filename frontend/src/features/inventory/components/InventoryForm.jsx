import { useEffect, useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '../../../components/ui/Button';
import {
  LABEL_OPTIONS,
  STATUS_OPTIONS,
  calculateItemMetrics,
  formatCurrency,
} from '../utils';

const defaultValues = {
  item_name: '',
  description: '',
  acquisition_date: '',
  acquisition_cost: '',
  salvage_value: '',
  useful_life_years: '5',
  quantity: '1',
  status: 'good',
  label: 'church-provided',
  remarks: '',
  ministry_name: '',
};

const numberFields = new Set(['acquisition_cost', 'salvage_value', 'useful_life_years', 'quantity']);

const normalizeInitialValues = (values) => {
  if (!values) return { ...defaultValues };
  return Object.entries({ ...defaultValues, ...values }).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      acc[key] = defaultValues[key] ?? '';
      return acc;
    }

    if (numberFields.has(key)) {
      acc[key] = value === '' ? '' : String(value);
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
};

export const InventoryForm = ({ initialValues, submitting, onSubmit, onCancel }) => {
  const [values, setValues] = useState(() => normalizeInitialValues(initialValues));

  useEffect(() => {
    setValues(normalizeInitialValues(initialValues));
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      item_name: values.item_name.trim(),
      description: values.description.trim(),
      acquisition_date: values.acquisition_date || null,
      acquisition_cost: values.acquisition_cost === '' ? null : Number(values.acquisition_cost),
      salvage_value: values.salvage_value === '' ? null : Number(values.salvage_value),
      useful_life_years:
        values.useful_life_years === '' ? null : Number(values.useful_life_years),
      quantity: values.quantity === '' ? 0 : Number(values.quantity),
      status: values.status,
      label: values.label || '',
      remarks: values.remarks.trim(),
      ministry_name: values.ministry_name.trim(),
    };
    onSubmit?.(payload);
  };

  const previewMetrics = useMemo(
    () =>
      calculateItemMetrics({
        quantity: Number(values.quantity),
        acquisition_cost: values.acquisition_cost === '' ? 0 : Number(values.acquisition_cost),
        salvage_value: values.salvage_value === '' ? 0 : Number(values.salvage_value),
        useful_life_years:
          values.useful_life_years === '' ? 0 : Number(values.useful_life_years),
        acquisition_date: values.acquisition_date,
      }),
    [values]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Item Name
          </label>
          <input
            type="text"
            name="item_name"
            required
            value={values.item_name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
            placeholder="Mixer, speaker, lighting, etc."
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Ministry
          </label>
          <input
            type="text"
            name="ministry_name"
            value={values.ministry_name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
            placeholder="e.g. Music, Events, Youth"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase text-sbcc-gray">Description</label>
        <textarea
          name="description"
          rows={3}
          value={values.description}
          onChange={handleChange}
          className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          placeholder="Add a short description so ministry heads know how to handle this equipment."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Acquisition Date
          </label>
          <input
            type="date"
            name="acquisition_date"
            value={values.acquisition_date}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Status
          </label>
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          >
            {STATUS_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Acquisition Cost
          </label>
          <input
            type="number"
            name="acquisition_cost"
            min="0"
            step="0.01"
            value={values.acquisition_cost}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Salvage Value
          </label>
          <input
            type="number"
            name="salvage_value"
            min="0"
            step="0.01"
            value={values.salvage_value}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">
            Useful Life (years)
          </label>
          <input
            type="number"
            name="useful_life_years"
            min="1"
            value={values.useful_life_years}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">Quantity</label>
          <input
            type="number"
            name="quantity"
            min="0"
            value={values.quantity}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">Label</label>
          <select
            name="label"
            value={values.label}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
          >
            {LABEL_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase text-sbcc-gray">Remarks</label>
          <input
            type="text"
            name="remarks"
            value={values.remarks}
            onChange={handleChange}
            className="w-full rounded-2xl border border-sbcc-gray/30 bg-white px-4 py-3 text-sbcc-dark placeholder:text-sbcc-gray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--sbcc-primary)]"
            placeholder="E.g. Needs recalibration."
          />
        </div>
      </div>

      <div className="rounded-3xl border border-sbcc-gray/20 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sbcc-gray">
          Depreciation preview
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sbcc-gray text-xs">Current book value</p>
            <p className="text-lg font-semibold text-sbcc-dark">
              {formatCurrency(previewMetrics.bookValuePerUnit * previewMetrics.quantity)}
            </p>
          </div>
          <div>
            <p className="text-sbcc-gray text-xs">Annual depreciation / unit</p>
            <p className="text-lg font-semibold text-sbcc-dark">
              {formatCurrency(previewMetrics.annualDepreciationPerUnit || 0)}
            </p>
          </div>
          <div>
            <p className="text-sbcc-gray text-xs">Percent depreciated</p>
            <p className="text-lg font-semibold text-sbcc-dark">
              {previewMetrics.depreciationPercent.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <SecondaryButton type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" loading={submitting}>
          Save Asset
        </PrimaryButton>
      </div>
    </form>
  );
};

export default InventoryForm;
