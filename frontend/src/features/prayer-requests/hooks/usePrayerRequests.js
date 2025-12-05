//// filepath: c:\Users\63923\Desktop\sbcc-management-system\frontend\src\features\prayer_requests\hooks\usePrayerRequests.js
import { useEffect, useState } from 'react';
import { getPrayerRequests } from '../../../api/prayer-requests.api';
import { useSnackbar } from '../../../hooks/useSnackbar';

export function usePrayerRequests(initialParams = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialParams.page || 1);
  const [pageSize, setPageSize] = useState(initialParams.pageSize || 10);
  const [search, setSearch] = useState(initialParams.search || '');

  const [totalCount, setTotalCount] = useState(0);

  const { showError } = useSnackbar();

  const fetchRequests = async (overrideParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        page_size: pageSize,
        search,
        ...overrideParams,
      };

      const response = await getPrayerRequests(params);

      const results = response.results || response.data || [];
      const count =
        response.count ?? response.total ?? (Array.isArray(results) ? results.length : 0);

      setRequests(results);
      setTotalCount(count);
    } catch (err) {
      console.error('Failed to fetch prayer requests', err);
      setError(err);
      showError('Failed to load prayer requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  return {
    requests,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    setPage,
    setPageSize,
    search,
    setSearch,
    refetch: fetchRequests,
  };
}

export default usePrayerRequests;
