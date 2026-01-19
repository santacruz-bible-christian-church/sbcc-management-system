import { useCallback, useEffect, useMemo, useState } from 'react';
import { inventoryApi } from '../../../api/inventory.api';
import { ministriesApi } from '../../../api/ministries.api';
import { generateInventoryReportPDF } from '../utils/inventoryReportPDF';
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
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [search, setSearch] = useState('');

  // Fetch ALL ministries (handle pagination)
  const fetchMinistries = useCallback(async () => {
    try {
      let allMinistries = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const response = await ministriesApi.listMinistries({ page, page_size: 100 });
        const pageResults = response?.results || [];
        allMinistries = [...allMinistries, ...pageResults];

        // Check if there's a next page
        hasMore = !!response?.next;
        page++;
      }

      // Extract names WITHOUT filtering by is_active (for now)
      const ministryNames = allMinistries
        .map((m) => m.name)
        .filter(Boolean) // Remove null/undefined names
        .sort((a, b) => a.localeCompare(b));

      setMinistries(ministryNames);
    } catch (err) {
      console.error('Failed to fetch ministries:', err);
      setMinistries([]);
    }
  }, []);

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
    fetchMinistries();
    fetchItems();
  }, [fetchMinistries, fetchItems]);

  // Merge API ministries with ministries found in inventory items
  const ministryOptions = useMemo(() => {
    const uniqueMinistries = new Set(ministries);

    // Add any ministries from inventory items that aren't in the API response
    items.forEach((item) => {
      const ministry = item.ministry_name?.trim();
      if (ministry && ministry.toLowerCase() !== 'events') {
        uniqueMinistries.add(ministry);
      }
    });

    return Array.from(uniqueMinistries).sort((a, b) => a.localeCompare(b));
  }, [ministries, items]);

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

  const downloadReport = useCallback((dateRange = {}) => {
    const { startDate, endDate } = dateRange;

    // Filter items by acquisition_date if range provided
    let itemsToExport = filteredItems;
    if (startDate || endDate) {
      itemsToExport = filteredItems.filter((item) => {
        if (!item.acquisition_date) return false;
        const itemDate = new Date(item.acquisition_date);

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return true;
      });
    }

    generateInventoryReportPDF(itemsToExport, summary);
  }, [filteredItems, summary]);

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
