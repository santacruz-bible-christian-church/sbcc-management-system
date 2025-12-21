import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventsApi } from '../../../api/events.api';
import { DEFAULT_FILTERS, DEFAULT_ORDERING } from '../utils/constants';
import {
  calculateCompletionRate,
  cleanFilters,
  summarizeEvents,
} from '../utils/format';

const DEFAULT_PAGE_SIZE = 12;

const initialQuery = {
  filters: { ...DEFAULT_FILTERS },
  search: '',
  ordering: DEFAULT_ORDERING,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [pagination, setPagination] = useState({
    count: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.listEvents({
        filters: cleanFilters(query.filters),
        search: query.search || undefined,
        ordering: query.ordering,
        page: query.page,
        pageSize: query.pageSize,
      });

      // Handle both paginated and non-paginated responses
      const results = Array.isArray(data) ? data : data.results ?? [];
      const count = data.count ?? results.length;
      const totalPages = Math.ceil(count / query.pageSize) || 1;

      const normalizedEvents = results.map(event => ({
        ...event,
        date: event.start_datetime || event.date,
        end_date: event.end_datetime || event.end_date,
      }));

      setEvents(normalizedEvents);
      setPagination({
        count,
        currentPage: query.page,
        totalPages,
        hasNext: !!data.next || query.page < totalPages,
        hasPrevious: !!data.previous || query.page > 1,
      });
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.response?.data?.detail || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const summary = useMemo(() => summarizeEvents(events), [events]);
  const completionRate = useMemo(() => calculateCompletionRate(summary), [summary]);

  const setFilters = (updater) => {
    setQuery((prev) => ({
      ...prev,
      filters: typeof updater === 'function' ? updater(prev.filters) : updater,
      page: 1, // Reset to first page when filters change
    }));
  };

  const setSearch = (searchValue) => {
    setQuery((prev) => ({
      ...prev,
      search: searchValue,
      page: 1, // Reset to first page when search changes
    }));
  };

  const setOrdering = (ordering) => {
    setQuery((prev) => ({
      ...prev,
      ordering,
      page: 1, // Reset to first page when ordering changes
    }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const resetQuery = () => {
    setQuery({
      filters: { ...DEFAULT_FILTERS },
      search: '',
      ordering: DEFAULT_ORDERING,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  };

  const runAndRefresh = async (action) => {
    setLoading(true);
    setError(null);
    try {
      await action();
      await fetchEvents();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update event.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = (payload) => runAndRefresh(() => eventsApi.createEvent(payload));
  const updateEvent = (id, payload) => runAndRefresh(() => eventsApi.updateEvent(id, payload));
  const deleteEvent = (id) => runAndRefresh(() => eventsApi.deleteEvent(id));
  const registerForEvent = (id) => runAndRefresh(() => eventsApi.registerForEvent(id));
  const unregisterFromEvent = (id) =>
    runAndRefresh(() => eventsApi.unregisterFromEvent(id));

  const listRegistrations = (eventId) => eventsApi.listEventRegistrations(eventId);

  return {
    events,
    loading,
    error,
    filters: query.filters,
    search: query.search,
    ordering: query.ordering,
    pagination,
    summary,
    completionRate,
    setFilters,
    setSearch,
    setOrdering,
    goToPage,
    resetQuery,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    listRegistrations,
  };
};
