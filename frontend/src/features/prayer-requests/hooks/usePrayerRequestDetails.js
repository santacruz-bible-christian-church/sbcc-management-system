//// filepath: c:\Users\63923\Desktop\sbcc-management-system\frontend\src\features\prayer_requests\hooks\usePrayerRequestDetails.js
import { useEffect, useState } from 'react';
import { getPrayerRequestById } from '../../../api/prayer-requests.api';
import { useSnackbar } from '../../../hooks/useSnackbar'; // ← named import

export function usePrayerRequestDetails(id) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const { showError } = useSnackbar();

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPrayerRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error('Failed to fetch prayer request details', err);
        setError(err);
        showError('Failed to load prayer request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, showError]);

  return { request, loading, error };
}

export default usePrayerRequestDetails;
