import { useCallback, useEffect, useMemo, useState } from 'react';
import { inventoryApi } from '../../../api/inventory.api';
import {
  DEFAULT_FILTERS,
  buildLabelBreakdown,
  buildStatusBreakdown,
  calculateItemMetrics,
  normalizeInventoryResponse,
  summarizeInventory,
} from '../utils';

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.listItems();
      const normalized = normalizeInventoryResponse(response).map((item) => ({
        ...item,
        metrics: calculateItemMetrics(item),
      }));
      setItems(normalized);
    } catch (err) {
      console.error('Inventory fetch failed:', err);
      setError(err.response?.data?.detail || 'Unable to load inventory records.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const ministryOptions = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      if (item.ministry_name) {
        unique.add(item.ministry_name);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query
        ? true
        : [
            item.item_name,
            item.description,
            item.ministry_name,
            item.remarks,
            item.label,
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query));

      const matchesStatus =
        filters.status === 'all' || (item.status || '').toLowerCase() === filters.status;
      const matchesLabel =
        filters.label === 'all' || (item.label || '').toLowerCase() === filters.label;
      const matchesMinistry =
        filters.ministry === 'all' ||
        (item.ministry_name || '').toLowerCase() === filters.ministry.toLowerCase();

      return matchesSearch && matchesStatus && matchesLabel && matchesMinistry;
    });
  }, [filters, items, search]);

  const summary = useMemo(() => summarizeInventory(items), [items]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(items), [items]);
  const labelBreakdown = useMemo(() => buildLabelBreakdown(items), [items]);

  const runMutation = useCallback(
    async (mutation) => {
      setLoading(true);
      setError(null);
      try {
        await mutation();
        await fetchItems();
      } catch (err) {
        console.error('Inventory mutation failed:', err);
        const detail = err.response?.data;
        const message =
          detail?.detail ||
          Object.values(detail || {})?.[0] ||
          'Unable to update inventory.';
        setError(typeof message === 'string' ? message : 'Unable to update inventory.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchItems]
  );

  const createItem = useCallback(
    (payload) => runMutation(() => inventoryApi.createItem(payload)),
    [runMutation]
  );

  const updateItem = useCallback(
    (id, payload) => runMutation(() => inventoryApi.updateItem(id, payload)),
    [runMutation]
  );

  const deleteItem = useCallback(
    (id) => runMutation(() => inventoryApi.deleteItem(id)),
    [runMutation]
  );

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearch('');
  };

  const downloadReport = useCallback(async () => {
    const blob = await inventoryApi.downloadReport();
    if (typeof window === 'undefined') return;
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_depreciation_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  return {
    items,
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
    refresh: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    downloadReport,
  };
};

export default useInventory;
