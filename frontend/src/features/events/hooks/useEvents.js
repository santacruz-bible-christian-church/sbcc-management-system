import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventsApi } from '../../../api/events.api';
import { DEFAULT_FILTERS, DEFAULT_ORDERING } from '../utils/constants';
import {
  calculateAttendanceRate,
  calculateCompletionRate,
  cleanFilters,
  summarizeEvents,
} from '../utils/format';

const initialQuery = {
  filters: { ...DEFAULT_FILTERS },
  search: '',
  ordering: DEFAULT_ORDERING,
};

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.listEvents({
        filters: cleanFilters(query.filters),
        search: query.search || undefined,
        ordering: query.ordering,
        page: 1,
        pageSize: 100,
      });

      const results = Array.isArray(data) ? data : data.results ?? [];
      setEvents(results);
    } catch (err) {
      setEvents([]);
      setError(err.response?.data?.detail || 'Unable to load events right now.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const summary = useMemo(() => summarizeEvents(events), [events]);
  const completionRate = useMemo(() => calculateCompletionRate(summary), [summary]);
  const attendanceRate = useMemo(() => calculateAttendanceRate(summary), [summary]);

  const setFilters = (updater) => {
    setQuery((prev) => ({
      ...prev,
      filters: typeof updater === 'function' ? updater(prev.filters) : updater,
    }));
  };

  const setSearch = (searchValue) => {
    setQuery((prev) => ({
      ...prev,
      search: searchValue,
    }));
  };

  const setOrdering = (ordering) => {
    setQuery((prev) => ({
      ...prev,
      ordering,
    }));
  };

const resetQuery = () => {
  setQuery({
    filters: { ...DEFAULT_FILTERS },
    search: '',
    ordering: DEFAULT_ORDERING,
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

  const getAttendanceReport = (eventId) => eventsApi.getAttendanceReport(eventId);
  const markRegistrationAttended = (registrationId) =>
    runAndRefresh(() => eventsApi.markRegistrationAttended(registrationId));
  const listRegistrations = (eventId) => eventsApi.listEventRegistrations(eventId);

  return {
    events,
    loading,
    error,
    filters: query.filters,
    search: query.search,
    ordering: query.ordering,
    summary,
    completionRate,
    attendanceRate,
    setFilters,
    setSearch,
    setOrdering,
    resetQuery,
    refresh: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    getAttendanceReport,
    markRegistrationAttended,
    listRegistrations,
  };
};
