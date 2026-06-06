import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/src/types/auth';
import type { Event } from '@/src/types/events';
import { eventsService } from '@/src/services/events';

const PAGE_LIMIT = 20;

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Prevent concurrent fetches
  const fetchingRef = useRef(false);

  const loadEvents = useCallback(async (page: number, reset: boolean) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setError(null);

    if (reset) {
      // Initial load and refresh manage their own loading states externally
    } else {
      setLoading(true); // Pagination
    }

    try {
      const response = await eventsService.list({ page, limit: PAGE_LIMIT });
      setEvents((prev) => (reset ? response.data : [...prev, ...response.data]));
      setHasNextPage(response.pagination.has_next_page);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al cargar los eventos';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      fetchingRef.current = false;
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadEvents(1, true);
  }, [loadEvents]);

  const loadMore = useCallback(() => {
    if (!hasNextPage || loading || refreshing) return;
    loadEvents(currentPage + 1, false);
  }, [hasNextPage, loading, refreshing, currentPage, loadEvents]);

  useEffect(() => {
    setLoading(true);
    loadEvents(1, true);
  }, [loadEvents]);

  return { events, loading, refreshing, error, hasNextPage, loadMore, refresh };
}
